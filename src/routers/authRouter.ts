import express from "express";
import { loginController, logoutController, meController, refreshTokenController, signupController } from "../controllers/authController";
import { authLimiter } from "../limiters/limiter";
import { verifyToken } from "../middleware/verifyTokens";

const router = express.Router();

router.post("/signup", authLimiter, signupController);
router.post("/login", authLimiter, loginController);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);
router.get("/me", verifyToken, meController);
export default router;
