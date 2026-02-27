import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { UpdateProfileType } from "../types/UserType";

export const ProfileEditValidator = (data: UpdateProfileType) => {
  const ProfileEditSchema = z.object({
    user_name: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, dots, and underscores"),
    email: z.email("Invalid email").max(255, "Email must be less than 255 characters"),
    about: z.string().max(100, "Bio must be less than 100 characters").nullable().optional(),
    isPrivate: z.boolean().optional(),
  });

  const validationValue = ProfileEditSchema.safeParse(data);
  if (!validationValue.success) {
    const message = fromZodError(validationValue.error);
    console.log("validation error", message.details[0].message);
    return message.details[0].message;
  }
  return true;
};
