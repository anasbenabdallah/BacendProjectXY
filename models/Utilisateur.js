import mongoose from "mongoose";
import { baseSchemaFields } from "./BaseModel.js";
import bcrypt from "bcryptjs";
const utilisateurSchema = new mongoose.Schema(
  {
    ...baseSchemaFields,
    nom: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    motDePasse: { type: String, required: false },
  },
  { timestamps: true }
);
// Hash password before saving
utilisateurSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

// Compare password method
utilisateurSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.motDePasse);
};
export default mongoose.model("Utilisateur", utilisateurSchema);
