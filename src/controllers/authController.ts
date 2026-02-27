import { Request, Response, NextFunction } from "express";
import { SignUpRequestType, LogInDataType, LogInUserDataType } from "../types/AuthType";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { hash, compare } from "bcrypt-ts";
import "dotenv/config";
import { findUniqueUser, createUser } from "../service/authService";
import { SignUpValidator } from "../validators/signup.validator";
import { LogInValidator } from "../validators/login.validator";
import { UserJWT } from "../types/UserJwt";

export const signupController = async (req: Request<{}, {}, SignUpRequestType>, res: Response, next: NextFunction) => {
  try {
    const { email, password, confirmPassword, user_name } = req.body;

    const isExsits = await findUniqueUser(email);
    if (isExsits) throw { message: "Email is Already used try to log in .", statusCode: 400 };

    const validationResult = SignUpValidator({ email, password, confirmPassword, user_name }); //TODO : CONTUNE HERE AND ADD MESSAGE FOR FRONTEND
    if (validationResult !== true) throw { message: validationResult, statusCode: 400 };

    const hashedPassword = await hash(password, 10);

    const userData = {
      email: email,
      password: hashedPassword,
      user_name: user_name,
    };

    const user = await createUser(userData);
    if (!user) throw { message: "Cannot create user at this moment", statusCode: 400 };

    res.status(201).json({ message: "User Created!" });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req: Request<{}, {}, LogInDataType>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const validationResult = LogInValidator({ email, password });
    if (validationResult !== true) throw { message: validationResult, statusCode: 400 };

    const user = await findUniqueUser(email);
    if (!user) throw { message: "Invalid credentials", statusCode: 400 };

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw { message: "Invalid credentials", statusCode: 401 };

    const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
    const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "14d" });

    //TODO handle this in frontend
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, //15min
    });
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, //14d
    });
    
    const userData = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    } as LogInUserDataType;

    res.status(200).json({ message: "Logged in succes ", userData ,token});
  } catch (err) {
    next(err);
  }
};

export const refreshTokenController = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw { message: "Refresh token missing", statusCode: 401 };

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as UserJWT;

    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "15m",
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error instanceof TokenExpiredError) throw { message: "Refresh token expired", statusCode: 401 };
    if (error instanceof JsonWebTokenError) throw { message: "Invalid refresh token", statusCode: 403 };
    next(error);
  }
};
