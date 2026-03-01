import { prisma } from "../lib/prisma";
import { PostType } from "../types/PostType";

export const createPostService = async (
  { post_title, description, category, key }: PostType,
  authorId: string,
  baseUrl: string,
) => {
  try {
    const categories = category ?? [];

    const post = await prisma.post.create({
      data: {
        post_title: post_title,
        description: description ?? null,
        key: key,
        post_url: `${baseUrl}/${key}`,
        authorId: authorId,

        category: {
          connectOrCreate: categories.map((c: string) => ({
            where: { category_name: c.toLowerCase().trim() },
            create: { category_name: c.toLowerCase().trim() },
          })),
        },
      },
    });
    return post ?? null;
  } catch (err) {
    throw { message: "Error happend in service while trying to create post", statusCode: 500 };
  }
};

export const getPostsService = async (page: number, postsPerPage: number) => {
  const totalPost = await prisma.post.count();
  const totalPages = Math.ceil(totalPost / postsPerPage);

  const posts = await prisma.post.findMany({
    skip: (page - 1) * postsPerPage,
    take: postsPerPage,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, user_name: true, avatar: true, isPrivate: true } },
      category: true,
    },
  });
  if (!posts || !totalPages) {
    throw new Error("Error happend in service while trying to get posts");
  }
  return { posts, totalPages };
};

export const getPostService = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      favorited_by: { select: { id: true, user_name: true } },
      category: true,
      author: {
        select: {
          id: true,
          avatar: true,
          user_name: true,
          about: true,
          isPrivate: true,
          createdAt: true,
          followers: true,
          Uploaded_Posts: {
            take: 6,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              post_title: true,
              post_url: true,
              createdAt: true,
              favorited_by: true,
            },
          },
        },
      },
    },
  });
  return post ?? null;
};
export const getPostOnlyService = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  return post 
};
export const deletePostService = async (postId: string, userId: string) => {
  const postDeleted = await prisma.post.delete({
    where: {
      id_authorId: { id: postId, authorId: userId },
    },
  });

  return postDeleted
};

export const updateFavoriteService = async (postId: string, userId: string) => {
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      favorited_by: {
        some: { id: userId },
      },
    },
  });
  const updatedFavPost = await prisma.post.update({
    where: { id: postId },
    data: {
      favorited_by: existingPost ? { disconnect: { id: userId } } : { connect: { id: userId } },
    },
  });
  return updatedFavPost 
};

export const getAllCategoriesService = async () => {
  const categories = await prisma.category.findMany();
  return categories 
};
export const updatePostService = async (postId: string, userId: string, data: any) => {
  const updatedPost = await prisma.post.update({
    where: { id_authorId: { id: postId, authorId: userId } },
    data: {
      ...data,
    },
    include: {
      favorited_by: { select: { id: true, user_name: true } },
      category: true,
      author: {
        select: {
          id: true,
          avatar: true,
          user_name: true,
          about: true,
        },
      },
    },
  });

  return updatedPost
};
