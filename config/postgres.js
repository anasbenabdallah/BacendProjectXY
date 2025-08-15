// db/postgres.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "192.168.10.194", // VM IP
  database: "fleet_tracking",
  password: "anas123",
  port: 5432,
});

export default pool;
