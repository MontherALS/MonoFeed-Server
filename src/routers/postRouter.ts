import { Router } from "express";
import { verifyToken } from "../middleware/verifyTokens";
import {
  presignPost,
  uploadPost,
  getAllPosts,
  getPostById,
  deletePost,
  updatePostLike,
  getCategories,
  updatePost,
} from "../controllers/postController";
import { postLimiter } from "../limiters/limiter";

const router = Router();

router.post("/presign", verifyToken, postLimiter, presignPost);
router.post("/upload", verifyToken, postLimiter, uploadPost);

router.get("/all", getAllPosts);
router.get("/post/:id", getPostById);
router.put("/post/:id", verifyToken, postLimiter, updatePost);

router.delete("/post/:id", verifyToken, postLimiter, deletePost);

router.post("/favorites/:id", verifyToken, postLimiter, updatePostLike);

router.get("/categories", getCategories);


export default router;
