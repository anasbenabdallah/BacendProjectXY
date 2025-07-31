import Utilisateur from "../models/Utilisateur.js";
import jwt from "jsonwebtoken";

// Register
export const register = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;
    const existUser = await Utilisateur.findOne({ email });
    if (existUser)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const utilisateur = await Utilisateur.create({ nom, email, motDePasse });

    const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({ token, utilisateur });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur inscription", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isMatch = await utilisateur.comparePassword(motDePasse);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, utilisateur });
  } catch (error) {
    res.status(500).json({ message: "Erreur connexion", error: error.message });
  }
};
