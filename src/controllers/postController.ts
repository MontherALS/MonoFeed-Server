import { NextFunction, Request, Response } from "express";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/r2";
import checkMime from "../lib/checkMime";
import { PostValidator } from "../validators/post.validator";
import { PostEditValidator } from "../validators/postEdit.validator";
import { PostType, UpdatePostType } from "../types/PostType";
import {
  createPostService,
  getPostService,
  getPostsService,
  deletePostService,
  updateFavoriteService,
  getAllCategoriesService,
  updatePostService,
  getPostOnlyService,
} from "../service/postService";

export const presignPost = async (
  req: Request<{}, {}, { mimeType: string; postSize: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { mimeType, postSize } = req.body;

    const MAX_SIZE = Number(process.env.MAX_SIZE);
    if (postSize > MAX_SIZE) throw { message: "File size must be < 500MB", statusCode: 400 };

    const id = crypto.randomUUID();
    const info = checkMime(mimeType, false);
    if (!info) throw { message: "Unsupported file type", statusCode: 400 };

    const key = `${info.folder}/${id}.${info.ext}`;
    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });

    return res.json({ uploadUrl, key });
  } catch (err) {
    next(err);
  }
};
export const uploadPost = async (req: Request<{}, {}, PostType>, res: Response, next: NextFunction) => {
  try {
    const { key, post_title, description, category } = req.body;

    const validationResult = PostValidator({ key, post_title, description, category });
    if (validationResult !== true) throw { message: validationResult, statusCode: 400 };

    const baseUrl = process.env.R2_PUP_URL;
    if (!baseUrl) throw { message: "Server configuration error", statusCode: 500 };

    const post = await createPostService({ key, post_title, description, category }, req.user.id, baseUrl);
    if (!post) throw { message: "Cannot create post at this moment", statusCode: 400 };

    return res.status(201).json({ message: "Post created !" });
  } catch (err) {
    next(err);
  }
};

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 16;
    if (page < 1 || limit < 1) throw { message: "Page and limit must be positive integers", statusCode: 400 };

    const postsPerPage = limit;

    const { posts, totalPages } = await getPostsService(page, postsPerPage);
    return res.status(200).json({ posts, totalPages });
  } catch (err) {
    next(err);
  }
};
export const getPostById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;

    const post = await getPostService(postId);
    if (!post) throw { message: "cannot find post", statusCode: 400 };

    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await getPostOnlyService(postId);
    if (!post) throw { message: "Unable to find the post", statusCode: 404 };

    const cmd = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: post.key,
    });
    await s3.send(cmd);

    const deletedPost = await deletePostService(postId, userId);
    if (!deletedPost) throw { message: "Unable to delete the post", statusCode: 400 };

    res.status(200).json({ message: "Post Deleted" });
  } catch (err) {
    next(err);
  }
};
export const updatePostLike = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const updatedFavorite = await updateFavoriteService(postId, userId);
    if (!updatedFavorite) throw { message: "Unable to update favorite status", statusCode: 404 };

    res.status(200).json({ message: "Favorite status updated" });
  } catch (err) {
    next(err);
  }
};
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await getAllCategoriesService();
    if (!categories) throw { message: "Cannot find Categories !", statusCode: 404 };

    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};
export const updatePost = async (
  req: Request<{ id: string }, {}, UpdatePostType>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const { post_title, description, category } = req.body;

    const validationResult = PostEditValidator({ post_title, description, category });
    if (validationResult !== true) throw { message: validationResult, statusCode: 400 };

    const updateData: any = {};

    if (post_title !== undefined) updateData.post_title = post_title;
    if (description !== undefined) updateData.description = description;

    if (category !== undefined && Array.isArray(category)) {
      updateData.category = {
        set: [],
        connectOrCreate: category.map((name) => ({
          where: {
            category_name: name,
          },
          create: {
            category_name: name,
          },
        })),
      };
    }

    const updatedPost = await updatePostService(postId, userId, updateData as UpdatePostType);

    if (!updatedPost) throw { message: "Post not found or unauthorized", statusCode: 404 };

    return res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    next(err);
  }
};
