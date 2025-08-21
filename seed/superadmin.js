import bcrypt from "bcryptjs";
import Shared from "../models/Commun.js";

export default async function seedSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || "admin@example.com";
    const plain = process.env.SUPER_ADMIN_PASSWORD || "admin123";

    const existing = await Shared.findOne({
      type: "users",
      "data.email": email,
    });

    if (existing) {
      console.log("✅ Super admin already exists:", email);
      return;
    }

    const hashed = await bcrypt.hash(plain, 10);

    const doc = await Shared.create({
      status: true,
      type: "users",
      data: {
        email,
        password: hashed,
        type: "super_admin",
      },
    });

    console.log("✅ Super admin created:", doc.data.email);
  } catch (error) {
    console.error("❌ Error creating super admin:", error.message);
    throw error;
  }
}
