import mongoose from "mongoose";
import { baseSchemaFields } from "./BaseModel.js";

const voitureSchema = new mongoose.Schema(
  {
    ...baseSchemaFields,
    marque: { type: String, required: true },
    modele: { type: String, required: true },
    immatriculation: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Voiture", voitureSchema);
