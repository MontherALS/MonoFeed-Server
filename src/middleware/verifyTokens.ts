import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { UserJWT } from "../types/UserJwt";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw { message: "Invalid access token", statusCode: 401 };

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as UserJWT;

    req.user = { id: decoded.id };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) throw { message: "Token expired", statusCode: 401 };
    if (error instanceof JsonWebTokenError) throw { message: "Invalid token", statusCode: 403 };
    throw error;
  }
};
