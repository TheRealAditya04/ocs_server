import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/auth.js";
import applicationRoutes from "../routes/applications.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


app.use("/api", authRoutes);
app.use("/api", applicationRoutes);


export default app;
