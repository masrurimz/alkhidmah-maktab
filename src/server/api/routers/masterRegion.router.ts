import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const masterRegionRouter = createTRPCRouter({
  allProvince: publicProcedure.query(async ({ ctx }) => {
    const res = (await ctx.prisma.$runCommandRaw({
      aggregate: "master_region",
      pipeline: [
        {
          $project: { id: 1, name: 1, "regencies.id": 1, "regencies.name": 1 },
        },
      ],
      explain: false,
    })) as unknown as {
      cursor: {
        firstBatch: {
          id: string;
          name: string;
          regencies: { id: string; name: string }[];
        }[];
      };
    };

    return res.cursor.firstBatch;
  }),

  provinceById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const res = await ctx.prisma.$runCommandRaw({
        aggregate: "master_region",
        pipeline: [
          {
            $match: {
              id: input,
            },
          },
          {
            $project: {
              name: 1,
              id: 1,
              "regencies.id": 1,
              "regencies.name": 1,
            },
          },
        ],
        explain: false,
      });

      return res;
    }),

  regencyByProvinceId: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const res = await ctx.prisma.$runCommandRaw({
        aggregate: "master_region",
        pipeline: [
          {
            $match: {
              id: input,
            },
          },
          {
            $project: {
              name: 1,
              id: 1,
              "regencies.id": 1,
              "regencies.name": 1,
            },
          },
        ],
        explain: false,
      });

      return res;
    }),

  cities: publicProcedure
    .input(
      z.object({
        provinceId: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      return await ctx.prisma.masterRegionIndonesia.findMany();
    }),
});
