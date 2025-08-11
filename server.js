import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import communRoutes from "./routes/communRoutes.js";
import seedSuperAdmin from "./seed/superadmin.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", communRoutes);
app.use("/api/auth", authRoutes); // ← Ajouter /api pour cohérence

const PORT = process.env.PORT || 5000;

// Boot sequence: connect DB -> seed -> start server
(async () => {
  try {
    await connectDB();
    await seedSuperAdmin(); // ← auto-seed ici
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📧 Super admin: admin@example.com / admin123`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();
