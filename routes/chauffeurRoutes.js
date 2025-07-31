import express from "express";
import {
  getChauffeurs,
  getChauffeurById,
  createChauffeur,
  updateChauffeur,
  deleteChauffeur,
} from "../controllers/chauffeurController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
// All routes require authentication
router.use(protect);
router.get("/", getChauffeurs); // GET all
router.get("/:id", getChauffeurById); // GET one
router.post("/", createChauffeur); // CREATE
router.put("/:id", updateChauffeur); // UPDATE
router.delete("/:id", deleteChauffeur); // DELETE

export default router;
