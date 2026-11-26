import express from "express";
import { login } from "../controllers/Login.js";
import { signup } from "../controllers/Signup.js";

const router = express.Router();

router.post("/login", login);

router.post("/signup", signup);

export default router;
