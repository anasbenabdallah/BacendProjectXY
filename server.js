import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chauffeurRoutes from "./routes/chauffeurRoutes.js";
import voitureRoutes from "./routes/voitureRoutes.js";
import utilisateurRoutes from "./routes/utilisateurRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chauffeurs", chauffeurRoutes);
app.use("/api/voitures", voitureRoutes);
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
