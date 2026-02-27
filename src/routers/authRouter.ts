import express from "express";
import { loginController, refreshTokenController, signupController } from "../controllers/authController";
import { authLimiter } from "../limiters/limiter";

const router = express.Router();

router.post("/signup", authLimiter, signupController);
router.post("/login", authLimiter, loginController);
router.post("/refresh", refreshTokenController);
export default router;
