import { Router } from "express";
import { verifyToken } from "../middleware/verifyTokens";

import {
  getProfile,
  updateProfile,
  preSignAvatar,
  updateAvatarUrl,
  updateFollow,
  updateUnfollow,
  deleteAvatar,
} from "../controllers/userController";
import { profileLimiter } from "../limiters/limiter";

const router = Router();

router.get("/:id", verifyToken, getProfile);
router.put("/:id", verifyToken, profileLimiter, updateProfile);

router.post("/avatar-presign/:id", verifyToken, profileLimiter, preSignAvatar);
router.put("/avatar/:id", verifyToken, profileLimiter, updateAvatarUrl);
router.delete("/avatar/:id", verifyToken, profileLimiter, deleteAvatar);

router.post("/:id/follow", verifyToken, profileLimiter, updateFollow);
router.post("/:id/unfollow", verifyToken, profileLimiter, updateUnfollow);

export default router;
