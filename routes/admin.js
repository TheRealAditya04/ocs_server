import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();


router.get("/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT userid, role FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/profiles
 */
router.get("/admin/profiles", auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profile");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/applications
 */
router.get("/admin/applications", auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.profile_code,
        p.company_name,
        p.designation,
        a.entry_number,
        a.status
      FROM application a
      JOIN profile p ON a.profile_code = p.profile_code
      ORDER BY a.profile_code
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/admin/create-profile
 */
router.post("/admin/create-profile", auth, adminOnly, async (req, res) => {
  const { recruiter_email, company_name, designation } = req.body;

  try {
    // Validate recruiter exists
    const recruiter = await pool.query(
      "SELECT 1 FROM users WHERE userid=$1 AND role='recruiter'",
      [recruiter_email]
    );

    if (recruiter.rows.length === 0) {
      return res.status(400).json({ error: "Invalid recruiter" });
    }

    await pool.query(
      `INSERT INTO profile (recruiter_email, company_name, designation)
       VALUES ($1, $2, $3)`,
      [recruiter_email, company_name, designation]
    );

    res.json({ message: "Profile created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
