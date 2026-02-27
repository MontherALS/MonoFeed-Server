import { z } from "zod";
import { fromZodError } from "zod-validation-error";

type SignUpType = {
  user_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const SignUpValidator = (data: SignUpType) => {
  const SignUpShecma = z
    .object({
      email: z.email().max(255, "Email must be less than 255 characters"),
      user_name: z
        .string()
        .min(1, "Username must be at least 1 character")
        .max(30, "Username must be less than 30 characters")
        .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, dots, and underscores"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
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
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const validationValue = SignUpShecma.safeParse(data);

  if (!validationValue.success) {
    const message = fromZodError(validationValue.error);
    console.log("validation error", message.details[0].message);

    return message.details[0].message;
  }
  return true;
};
