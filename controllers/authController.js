// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Shared from "../models/Commun.js";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

// POST /auth/login
// body: { email, password }
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await Shared.findOne({
      type: "users",
      "data.email": email,
      status: true, // only active accounts
    });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const hash = user?.data?.password || "";
    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    // never return password
    const safeUser = {
      _id: user._id,
      status: user.status,
      type: user.type, // "users"
      data: {
        email: user.data.email,
        type: user.data.type, // "super_admin"
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur connexion", error: error.message });
  }
};
// controllers/authController.js
export const setPassword = async (req, res) => {
  try {
    let { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token et mot de passe requis" });
    }

    token = decodeURIComponent(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Shared.findById(decoded.id);
    if (!user || user.type !== "users") {
      return res.status(400).json({ message: "Utilisateur invalide" });
    }

    const hash = await bcrypt.hash(password, 10);

    // ✅ Toujours recréer data si vide
    user.data = { ...(user.data || {}), password: hash };

    user.status = true;
    await user.save();

    res.json({ message: "Mot de passe défini avec succès" });
  } catch (error) {
    console.error("Erreur setPassword:", error.message);
    res.status(400).json({
      message: "Token invalide ou expiré",
      error: error.message,
    });
  }
};
export const me = async (req, res) => {
  try {
    const user = await Shared.findById(req.userId);
    if (!user || user.type !== "users") {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const safeUser = {
      _id: user._id,
      status: user.status,
      type: user.type, // "users"
      data: {
        email: user.data.email,
        type: user.data.type, // 🔹 rôle
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json(safeUser);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur récupération utilisateur",
        error: error.message,
      });
  }
};
