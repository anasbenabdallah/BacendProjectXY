import express from "express";
import {
  getUtilisateurs,
  getUtilisateurById,
  createUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
} from "../controllers/utilisateurController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
// All routes require authentication
router.use(protect);
router.get("/", getUtilisateurs); // GET all
router.get("/:id", getUtilisateurById); // GET one
router.post("/", createUtilisateur); // CREATE
router.put("/:id", updateUtilisateur); // UPDATE
router.delete("/:id", deleteUtilisateur); // DELETE

export default router;
