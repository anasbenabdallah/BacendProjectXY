// routes/communRoutes.js
import express from "express";
import {
  getsharedList,
  getsharedById,
  createShared,
  updateShared,
  deleteShared,
} from "../controllers/communController.js";

const router = express.Router();

const ALLOWED_TYPES = [
  "enums",
  "cars",
  "drivers",
  "users",
  "affectations",
  "lists",
];

// Guard for :type in list/get-by-id routes
router.param("type", (req, res, next, type) => {
  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ message: `Type invalide: ${type}` });
  }
  next();
});

// ----- Lecture : user, admin, superadmin -----
router.get("/:type", getsharedList);
router.get("/:type/:id", getsharedById);

// ----- Création : admin, superadmin -----
router.post("/", createShared);

router.patch("/:type/:id", updateShared);
router.delete("/:type/:id", deleteShared);
export default router;
