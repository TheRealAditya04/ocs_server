import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();


router.get("/profiles", auth, async (req, res) => {
  const { userid, role } = req.user;

  try {
    // ================= STUDENT =================
    if (role === "student") {


      const accepted = await pool.query(
        "SELECT 1 FROM application WHERE entry_number=$1 AND status='Accepted'",
        [userid]
      );

      if (accepted.rows.length > 0) {
        return res.json({
          state: "ACCEPTED"
        });
      }

      
      const selected = await pool.query(
        `SELECT a.profile_code, p.company_name, p.designation
         FROM application a
         JOIN profile p ON a.profile_code = p.profile_code
         WHERE a.entry_number=$1 AND a.status='Selected'`,
        [userid]
      );

      if (selected.rows.length > 0) {
        return res.json({
          state: "SELECTED",
          offer: selected.rows[0]
        });
      }

    
      const profiles = await pool.query(
        "SELECT profile_code, company_name, designation FROM profile"
      );

      return res.json({
        state: "OPEN",
        profiles: profiles.rows
      });
    }

    // ================= RECRUITER =================
    if (role === "recruiter") {
      const result = await pool.query(
        "SELECT * FROM profile WHERE recruiter_email=$1",
        [userid]
      );
      return res.json(result.rows);
    }

    // ================= ADMIN =================
    const result = await pool.query("SELECT * FROM profile");
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
