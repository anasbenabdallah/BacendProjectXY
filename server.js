import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import communRoutes from "./routes/communRoutes.js";
import seedSuperAdmin from "./seed/superadmin.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pgDataRoutes from "./routes/pgDataRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", communRoutes);
app.use("/api/auth", authRoutes); // ← Ajouter /api pour cohérence
app.use("/dashboard", dashboardRoutes);
app.use("/api-pg", pgDataRoutes);

const PORT = process.env.PORT || 5000;

// Boot sequence: connect DB -> seed -> start server
(async () => {
  try {
    await connectDB();
    await seedSuperAdmin(); // ← auto-seed ici
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📧 Super admin: admin@example.com / admin123`);
      console.log("SMTP_HOST =", process.env.SMTP_HOST);
      console.log("SMTP_USER =", process.env.SMTP_USER);
      console.log("SMTP_PASS =", process.env.SMTP_PASS ? "****" : "MISSING");
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();
