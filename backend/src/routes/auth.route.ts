import { Router } from "express";
import {  getMe, registerUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.get("/curr_user",getMe)

export default router;