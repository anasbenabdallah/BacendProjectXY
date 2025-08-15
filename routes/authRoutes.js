// routes/authRoutes.js
import express from "express";
import { login, setPassword, me } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/set-password", setPassword);
router.get("/me", authMiddleware, me); // ✅ nouvelle route

export default router;
