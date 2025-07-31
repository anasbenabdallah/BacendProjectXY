import express from "express";
import {
  getVoitures,
  getVoitureById,
  createVoiture,
  updateVoiture,
  deleteVoiture,
} from "../controllers/voitureController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getVoitures); // GET all
router.get("/:id", getVoitureById); // GET one
router.post("/", createVoiture); // CREATE
router.put("/:id", updateVoiture); // UPDATE
router.delete("/:id", deleteVoiture); // DELETE

export default router;
