import { prisma } from "../lib/prisma";
import { SignUpType } from "../types/AuthType";

export const findUniqueUser = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: email } });
  return user 
};

export const createUser = async (data: SignUpType) => {
  const user = await prisma.user.create({
    data: data,
  });
  return user;
};
