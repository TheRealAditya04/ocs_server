import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { userid, password_md5 } = req.body;

  const result = await pool.query(
    "SELECT userid, password_hash, role FROM users WHERE userid=$1",
    [userid]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = result.rows[0];

  if (user.password_hash !== password_md5)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userid: user.userid, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );

  res.json({ token, role: user.role });
});

export default router;
