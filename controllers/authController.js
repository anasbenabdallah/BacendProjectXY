// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Shared from "../models/Commun.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
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
