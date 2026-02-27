import { Request, Response, NextFunction } from "express";
import {
  getAllCategoriesService,
  getCategoryPostsService,
} from "../service/categoryService";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAllCategoriesService();
    if (!result) throw { message: "Failed to fetch categories", statusCode: 500 };

    res.status(200).json({
      categories: result.categories,
      popular: result.popular,
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryPosts = async (
  req: Request<{ categoryName: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const postsPerPage = 12;

    if (page < 1) throw { message: "Page must be a positive integer", statusCode: 400 };

    const result = await getCategoryPostsService(categoryName, page, postsPerPage);
    if (!result) throw { message: "Failed to fetch category posts", statusCode: 500 };

    res.status(200).json({
      posts: result.posts,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};
