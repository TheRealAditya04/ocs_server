import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;
console.log("DB URL FROM ENV:", process.env.SUPABASE_DB_URL);

export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
