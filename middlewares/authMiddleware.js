// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Shared from "../models/Commun.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }
  const token = h.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Shared.findById(decoded.id);
    if (!user || user.type !== "users" || !user.status) {
      return res.status(401).json({ message: "Token invalide" });
    }
    req.user = user; // full Shared doc (contains data.*)
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide" });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  const role = req.user?.data?.type;
  if (role !== "super_admin") {
    return res
      .status(403)
      .json({ message: "Accès interdit (super admin requis)" });
  }
  next();
};
// middlewares/authMiddleware.js

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
}
