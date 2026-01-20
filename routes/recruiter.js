import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/recruiter/me
 */
router.get("/recruiter/me", auth, async (req, res) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json({
    recruiter_email: req.user.userid
  });
});

/**
 * GET /api/recruiter/profiles
 */
router.get("/recruiter/profiles", auth, async (req, res) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const result = await pool.query(
    "SELECT * FROM profile WHERE recruiter_email=$1",
    [req.user.userid]
  );

  res.json(result.rows);
});

/**
 * POST /api/recruiter/create-profile
 */
router.post("/recruiter/create-profile", auth, async (req, res) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { company_name, designation } = req.body;

  await pool.query(
    `INSERT INTO profile (recruiter_email, company_name, designation)
     VALUES ($1, $2, $3)`,
    [req.user.userid, company_name, designation]
  );

  res.json({ message: "Profile created" });
});

/**
 * GET /api/recruiter/applications
 */
router.get("/recruiter/applications", auth, async (req, res) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const result = await pool.query(
    `
    SELECT 
      a.profile_code,
      a.entry_number,
      a.status,
      p.company_name,
      p.designation
    FROM application a
    JOIN profile p ON a.profile_code = p.profile_code
    WHERE p.recruiter_email = $1
    ORDER BY p.profile_code
    `,
    [req.user.userid]
  );

  res.json(result.rows);
});

export default router;