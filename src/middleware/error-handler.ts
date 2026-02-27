import { NextFunction, Request, Response } from "express";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An error occurred";
}

export default function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(error);
    return;
  }
  const statusCode =
    typeof error === "object" && error && "statusCode" in error && typeof (error as any).statusCode === "number"
      ? (error as any).statusCode
      : 500;

  res.status(statusCode).json({
    message: getErrorMessage(error) || "An error happend please check the logs",
  });
}
