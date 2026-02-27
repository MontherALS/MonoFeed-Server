import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { UserJWT } from "../types/UserJwt";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) throw { message: "Authorization header missing", statusCode: 401 }; 
    const accsessToken = req.cookies.accessToken;
    if (!authorization.startsWith("Bearer ")) throw { message: "Invalid authorization header", statusCode: 401 };

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserJWT;

    req.user = { id: decoded.id };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) throw { message: "Token expired", statusCode: 401 };
    if (error instanceof JsonWebTokenError) throw { message: "Invalid token", statusCode: 403 };
    throw error;
  }
};
