import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();


router.get("/users/me", auth, async (req, res) => {
  const { userid, role } = req.user;

  try {
    if (role === "admin") {
      const result = await pool.query(
        "SELECT userid, role FROM users"
      );
      return res.json(result.rows);
    }

    return res.json({ userid, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
