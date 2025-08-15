// controllers/pgDataController.js
import pool from "../config/postgres.js";

export const getTableData = async (req, res) => {
  try {
    const { table } = req.params;

    // Basic protection — list allowed tables
    const allowedTables = [
      "alerts",
      "customers",
      "defect_reports",
      "driver_activity_log",
      "drivers",
      "gps_data",
      "gps_devices",
      "gps_io_data",
      "inspection_items",
      "rest_reports",
      "spatial_ref_sys",
      "users",
      "vehicle_inspections",
      "vehicles",
      "zones"
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ message: `Table invalide: ${table}` });
    }

    const result = await pool.query(`SELECT * FROM ${table} LIMIT 100`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
