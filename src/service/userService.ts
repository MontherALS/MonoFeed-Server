import { prisma } from "../lib/prisma";

import { UpdateProfileType } from "../types/UserType";

export const getUserService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },

    select: {
      id: true,
      avatar: true,
      user_name: true,
      about: true,
      email: true,
      isPrivate: true,
      createdAt: true,
      avatar_key: true,
      Uploaded_Posts: {
        select: {
          id: true,
          post_title: true,
          post_url: true,
          key: true,
          createdAt: true,
          author: true,
        },
      },
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } },
    },
  });
  return user
};

export const getUserWithPasswordService = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user 
};
export const updateUserService = async (id: string, updatedData: UpdateProfileType) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...updatedData,
    },
  });
  return user ;
};
export const updateUserAvatarService = async (id: string, avatarKey: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: id },
    data: {
      avatar_key: avatarKey,
      avatar: avatarUrl,
    },
  });

  return user ?? null;
};
export const deleteUserAvatarService = async (id: string) => {
  const user = await prisma.user.update({
    where: { id: id },
    data: {
      avatar_key: null,
      avatar: null,
    },
  });
  return user 
};
export const updateFollowService = async (followerId: string, targetUserId: string) => {
  const follower = await prisma.follow.create({
    data: {
      followerId: followerId,

      followingId: targetUserId,
    },
  });

  return follower 
};
export const updateUnfollowService = async (followerId: string, targetUserId: string) => {
  const unfollow = await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: followerId,

        followingId: targetUserId,
      },
    },
  });
  return unfollow 
};
