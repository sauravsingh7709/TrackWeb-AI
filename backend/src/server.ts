import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import { clerkMiddleware } from '@clerk/express'
import authRoutes from "./routes/auth.route.js";

const app= express();
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Hello World from saurav");
});
app.get("/api/test_db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      message: "Database connected successfully",
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);

app.listen(5000,()=>{
    console.log("Server is running on port 5000 with watch enabled");
})