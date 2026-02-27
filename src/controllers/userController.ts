import checkMime from "../lib/checkMime";
import { prisma } from "../lib/prisma";
import { NextFunction, Request, Response } from "express";
import { hash, compare } from "bcrypt-ts";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UpdateProfileReqType, UpdateProfileType } from "../types/UserType";
import { s3 } from "../lib/r2";
import {
  getUserService,
  getUserWithPasswordService,
  updateUserService,
  updateUserAvatarService,
  updateUnfollowService,
  updateFollowService,
  deleteUserAvatarService,
} from "../service/userService";
import { ProfileEditValidator } from "../validators/profileEdit.validator";
import { ChangePasswordValidator } from "../validators/changePassword.validator";

export const getProfile = async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id;

  const user = await getUserService(id);

  if (!user) throw { message: "User not found", statusCode: 404 };

  res.status(200).json({ message: "got user details", user: user });
};

export const updateProfile = async (
  req: Request<{ id: string }, {}, UpdateProfileReqType>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user.id;

    const { user_name, email, about, avatar, isPrivate, currentPassword, newPassword, confirmPassword } = req.body;

    const validationResult = ProfileEditValidator({ user_name, email, about, isPrivate });
    if (validationResult !== true) throw { message: validationResult, statusCode: 400 };

    let updatedData: UpdateProfileType = {
      user_name,
      email,
      about,
      isPrivate,
    };

    if (currentPassword) {
      if (!newPassword || !confirmPassword)
        throw { message: "New password and confirm password are required", statusCode: 400 };

      const validationResult = ChangePasswordValidator({ currentPassword, newPassword, confirmPassword });
      if (validationResult !== true) throw { message: validationResult, statusCode: 400 };

      const user = await getUserWithPasswordService(id);
      if (!user) throw { message: "User not found", statusCode: 404 };

      const isMatch = await compare(currentPassword, user.password);
      if (!isMatch) throw { message: "Invalid credentials", statusCode: 400 };

      updatedData.password = await hash(newPassword, 10);
    }

    const updatedUser = await updateUserService(id, updatedData);
    if (!updatedUser) throw { message: "Update failed", statusCode: 400 };

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const preSignAvatar = async (req: Request<{}, {}, { mimeType: string }>, res: Response, next: NextFunction) => {
  try {
    const { mimeType } = req.body;
    const userId = req.user.id;

    const isImage = mimeType?.startsWith("image/");

    if (!isImage) throw { message: "The avatar must be in image format", statusCode: 400 };
    if (!userId) throw { message: "Unauthorized", statusCode: 401 };

    const avatarID = crypto.randomUUID();

    const info = checkMime(mimeType, true);
    if (!info) throw { message: "Unsupported file type", statusCode: 400 };

    const avatarKey = `${info.folder}/${avatarID}/avatar.${info.ext}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,

      Key: avatarKey,

      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });

    return res.json({ uploadUrl, avatarKey });
  } catch (err) {
    next(err);
  }
};

export const updateAvatarUrl = async (
  req: Request<{}, {}, { avatarKey: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { avatarKey } = req.body;
    const id = req.user.id;
    if (!avatarKey) throw { message: "Avatar key is required", statusCode: 400 };
    if (!id) throw { message: "Unauthorized", statusCode: 401 };

    const baseUrl = process.env.R2_PUP_URL;
    const avatarUrl = `${baseUrl}/${avatarKey}`;

    const user = await updateUserAvatarService(id, avatarKey, avatarUrl);

    if (!user) throw { message: "Cannot upload avatar to server", statusCode: 400 };

    return res.status(200).json({ message: "Avatar updated", avatarUrl: avatarUrl });
  } catch (err) {
    next(err);
  }
};
export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const user = await getUserService(userId);

    if (!user || !user.avatar_key) throw { message: "User has no avatar to delete", statusCode: 404 };

    const cmd = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: user.avatar_key,
    });

    await s3.send(cmd);

    const deletedAvatar = await deleteUserAvatarService(userId);
    if (!deletedAvatar) throw { message: "Failed to delete avatar from user profile", statusCode: 400 };

    res.status(200).json({ message: "Avatar deleted successfully" });
  } catch (err) {
    next(err);
  }
};
export const updateFollow = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user.id;
    const targetUserId = req.params.id;

    if (!followerId || !targetUserId) throw { message: "Cannot follow", statusCode: 400 };

    const follower = await updateFollowService(followerId, targetUserId);
    if (!follower) throw { message: "cannot update follow state", statusCode: 400 };

    res.status(200).json({ message: "user follow state updated !" });
  } catch (err) {
    next(err);
  }
};

export const updateUnfollow = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user.id;
    const targetUserId = req.params.id;

    if (!followerId || !targetUserId) throw { message: "Cannot Unfollow", statusCode: 400 };

    const unfollow = await updateUnfollowService(followerId, targetUserId);
    if (!unfollow) throw { message: "cannot update unfollow state", statusCode: 400 };

    res.status(200).json({ message: "user unfollow state updated !" });
  } catch (err) {
    next(err);
  }
};
