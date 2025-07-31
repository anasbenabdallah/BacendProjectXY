import mongoose from "mongoose";
import { baseSchemaFields } from "./BaseModel.js";

const chauffeurSchema = new mongoose.Schema(
  {
    ...baseSchemaFields,
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    permis: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Chauffeur", chauffeurSchema);
