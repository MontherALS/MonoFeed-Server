import { z } from "zod";
import { fromZodError } from "zod-validation-error";

type PostEditType = {
    post_title?: string;
    description?: string | null;
    category?: string[] | null;
};

export const PostEditValidator = (data: PostEditType) => {
    const PostEditSchema = z.object({
        post_title: z.string().min(2, "Post title must be at least 2 characters").max(30, "Post title must be less than 30 characters").optional(),
        description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
        category: z.array(z.string().min(1, "Category name cannot be empty").max(50, "Category name must be less than 50 characters")).nullable().optional().default([]),
    });
    const validationValue = PostEditSchema.safeParse(data);
    if (!validationValue.success) {
        const message = fromZodError(validationValue.error);
        console.log("validation error", message.details[0].message);
        return message.details[0].message;
    }
    return true;
};