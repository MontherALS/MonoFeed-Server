import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { PostType } from "../types/PostType";

export const PostValidator = (data: PostType) => {
  const PostSchema = z.object({
    key: z.string().min(1, "Key is required"),
    post_title: z.string().min(2, "Post title must be at least 2 characters").max(30, "Post title must be less than 30 characters"),
    description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
    category: z.array(z.string().min(1, "Category name cannot be empty").max(50, "Category name must be less than 50 characters")).optional().nullable().default([]),
  });

  const validationValue = PostSchema.safeParse(data);

  if (!validationValue.success) {
    const message = fromZodError(validationValue.error);
    console.log("validation error", message.details[0].message);
    return message.details[0].message;
  }
  return true;
};