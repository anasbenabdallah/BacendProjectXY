import pool from "./config/postgres.js";

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected:", res.rows[0]);
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } finally {
    pool.end();
  }
})();
