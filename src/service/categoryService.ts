import { prisma } from "../lib/prisma";

export const getAllCategoriesService = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        posts: {
          include: {
            author: {
              select: {
                isPrivate: true,
              },
            },
          },
        },
      },
    });

    const categoriesWithCount = categories
      .map((category) => {
        const publicPostsCount = category.posts.filter(
          (post) => !post.author.isPrivate || post.author.isPrivate === null
        ).length;
        
        return {
          id: category.id,
          category_name: category.category_name,
          posts: publicPostsCount,
        };
      })
      .sort((a, b) => b.posts - a.posts); 

    const popular = categoriesWithCount.slice(0, 6);

    return {
      categories: categoriesWithCount,
      popular: popular,
    };
  } catch (err) {
   throw { message: "Failed to fetch categories", statusCode: 500 };
  }
};

export const getCategoryPostsService = async (
  categoryName: string,
  page: number,
  postsPerPage: number
) => {
  try {
    const decodedCategoryName = decodeURIComponent(categoryName);
    
    const totalPosts = await prisma.post.count({
      where: {
        category: {
          some: {
            category_name: decodedCategoryName,
          },
        },
        author: {
          OR: [
            { isPrivate: false },
            { isPrivate: null },
          ],
        },
      },
    });
    
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    const posts = await prisma.post.findMany({
      where: {
        category: {
          some: {
            category_name: decodedCategoryName,
          },
        },
        author: {
          OR: [
            { isPrivate: false },
            { isPrivate: null },
          ],
        },
      },
      include: {
        author: {
          select: {
            id: true,
            user_name: true,
            avatar: true,
            isPrivate: true,
          },
        },
        category: true,
        favorited_by: {
          select: {
            id: true,
            user_name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * postsPerPage,
      take: postsPerPage,
    });
    
    return {
      posts: posts,
      totalPages: totalPages,
    };
  } catch (err) {
    console.error("Error in getCategoryPostsService:", err);
    return null;
  }
};
