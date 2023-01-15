import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const regionCoordinatorRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.prisma.regionCoordiator.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return res;
  }),

  byPhone: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const res = await ctx.prisma.regionCoordiator.findMany({
      where: {
        phone: {
          contains: input,
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      take: 10,
    });

    return res;
  }),

  byName: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const res = await ctx.prisma.regionCoordiator.findMany({
      where: {
        name: {
          contains: input,
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      take: 10,
    });

    return res;
  }),
});
