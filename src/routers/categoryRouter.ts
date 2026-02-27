import { Router } from "express";
import { getAllCategories, getCategoryPosts } from "../controllers/categoryController";

const router = Router();

router.get("/", getAllCategories);
router.get("/:categoryName/posts", getCategoryPosts);

export default router;
