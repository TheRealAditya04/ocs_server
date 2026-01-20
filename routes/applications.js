import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();


router.post("/apply", auth, async (req, res) => {
  const { userid, role } = req.user;
  const { profile_code } = req.body;

  if (role !== "student")
    return res.status(403).json({ error: "Only students can apply" });

  try {
    
    const accepted = await pool.query(
      "SELECT 1 FROM application WHERE entry_number=$1 AND status='Accepted'",
      [userid]
    );

    if (accepted.rows.length > 0) {
      return res.status(400).json({
        error: "You have already accepted an offer"
      });
    }

    
    await pool.query(
      "INSERT INTO application (profile_code, entry_number) VALUES ($1,$2)",
      [profile_code, userid]
    );

    res.json({ message: "Applied successfully" });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Already applied" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/application/change_status", auth, async (req, res) => {
  const { userid, role } = req.user;
  const { profile_code, entry_number, status } = req.body;

  try {
    if (role === "recruiter") {
      const owns = await pool.query(
        "SELECT 1 FROM profile WHERE profile_code=$1 AND recruiter_email=$2",
        [profile_code, userid]
      );

      if (owns.rows.length === 0) {
        return res.status(403).json({ error: "Not your profile" });
      }
    }

    await pool.query(
      "UPDATE application SET status=$1 WHERE profile_code=$2 AND entry_number=$3",
      [status, profile_code, entry_number]
    );

    res.json({ message: "Status updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/application/accept", auth, async (req, res) => {
  const { userid, role } = req.user;
  const { profile_code } = req.body;

  if (role !== "student")
    return res.status(403).json({ error: "Forbidden" });

  try {
    await pool.query(
      `
      UPDATE application
      SET status = CASE
        WHEN profile_code = $1 THEN 'Accepted'
        ELSE 'Not Selected'
      END
      WHERE entry_number = $2 AND status = 'Selected'
      `,
      [profile_code, userid]
    );


    res.json({ message: "Offer accepted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/my-applications", auth, async (req, res) => {
  const { userid, role } = req.user;

  if (role !== "student") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        a.profile_code,
        a.status,
        p.company_name,
        p.designation
      FROM application a
      JOIN profile p
        ON a.profile_code = p.profile_code
      WHERE a.entry_number = $1
      `,
      [userid]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * POST /api/application/reject
 * Student rejects a selected offer
 */
router.post("/application/reject", auth, async (req, res) => {
  const { profile_code } = req.body;
  const { userid, role } = req.user;

  if (role !== "student") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    // Ensure this application is SELECTED
    const check = await pool.query(
      `
      SELECT status
      FROM application
      WHERE profile_code = $1 AND entry_number = $2
      `,
      [profile_code, userid]
    );

    if (
      check.rows.length === 0 ||
      check.rows[0].status !== "Selected"
    ) {
      return res.status(400).json({ error: "Invalid reject action" });
    }

    // Revert to Not Selected
    await pool.query(
      `
      UPDATE application
      SET status = 'Not Selected'
      WHERE profile_code = $1 AND entry_number = $2
      `,
      [profile_code, userid]
    );

    res.json({ message: "Offer rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
