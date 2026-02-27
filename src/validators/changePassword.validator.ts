import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ChangePasswordType } from "../types/UserType";

export const ChangePasswordValidator = (data: ChangePasswordType) => {
  const ChangePasswordSchema = z
    .object({
      currentPassword: z.string().min(8, "Wrong password").max(128, "Password must be less than 128 characters"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(128, "Password must be less than 128 characters")
        .refine((val) => /[A-Z]/.test(val), {
          message: "Must contain at least one uppercase letter",
        })
        .refine((val) => /[a-z]/.test(val), {
          message: "Must contain at least one lowercase letter",
        })
        .refine((val) => /[0-9]/.test(val), {
          message: "Must contain at least one number",
        })
        .refine((val) => /[^A-Za-z0-9]/.test(val), {
          message: "Must contain at least one special character",
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  const validationValue = ChangePasswordSchema.safeParse(data);
  if (!validationValue.success) {
    const message = fromZodError(validationValue.error);
    console.log("validation error", message.details[0].message);
    return message.details[0].message;
  }
  return true;
};
