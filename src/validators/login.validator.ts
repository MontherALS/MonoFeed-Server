import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { LogInDataType } from "../types/AuthType";

export const LogInValidator = (data: LogInDataType) => {
  const LogInShecma = z
    .object({
      email: z.email(),
      password: z.string().min(8, "Wrong password").max(128, "Password must be less than 128 characters"),
    });

  const validationValue = LogInShecma.safeParse(data);
  
  if (!validationValue.success) {
    const message = fromZodError(validationValue.error);
    console.log("validation error", message);
    return message.details[0].message;
  }
  return true;
};
