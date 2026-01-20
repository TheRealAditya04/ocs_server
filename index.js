import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profiles.js";
import applicationRoutes from "./routes/applications.js";
import { pool } from "./db.js";
import adminRoutes from "./routes/admin.js";
import recruiterRoutes from "./routes/recruiter.js";






pool.query("SELECT 1")
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ DB connection failed", err));


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", profileRoutes);
app.use("/api", applicationRoutes);
app.use("/api", adminRoutes);
app.use("/api", recruiterRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
