import { prisma } from "./session";

export type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
