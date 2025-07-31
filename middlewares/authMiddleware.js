import jwt from "jsonwebtoken";
import Utilisateur from "../models/Utilisateur.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.utilisateur = await Utilisateur.findById(decoded.id).select(
        "-motDePasse"
      );
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalide" });
    }
  }
  res.status(401).json({ message: "Accès refusé, token manquant" });
};
