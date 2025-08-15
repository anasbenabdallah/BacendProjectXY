// routes/pgDataRoutes.js
import express from "express";
import { getTableData } from "../controllers/pgDataController.js";

const router = express.Router();

// GET /api-pg/drivers   → fetch first 100 rows from drivers table
router.get("/:table", getTableData);

export default router;
