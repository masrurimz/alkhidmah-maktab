import { ContingentVechileType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const bookingCreateInput = z
  .array(
    z
      .object({
        personCount: z.number().positive(),
        vechileType: z.nativeEnum(ContingentVechileType),
        coordinator: z.object({
          name: z.string(),
          phone: z.string(),
        }),
      })
      .required()
  )
  .nonempty();
export type BookingCreateInput = z.infer<typeof bookingCreateInput>;

export const bookingRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        booker: z.object({
          name: z.string(),
          phone: z.string(),
        }),
        regionCoordinator: z.object({
          id: z.string().optional(),
          name: z.string(),
          phone: z.string(),
        }),
        province: z.object({
          id: z.string(),
          name: z.string(),
        }),
        city: z.object({
          id: z.string(),
          name: z.string(),
        }),
        contingent: bookingCreateInput,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.contingent.length) {
        throw new Error("Multiple contingents not supported yet");
      }

      const prefixWithZeros = (number: number, length = 2) =>
        String(number).padStart(length, "0");

      const cityCount = await ctx.prisma.booking.count({
        where: {
          contingentAddress: {
            is: {
              city: input.city,
            },
          },
        },
      });

      const booking = await ctx.prisma.booking.create({
        data: {
          booker: {
            name: input.booker.name,
            phone: input.booker.phone,
          },
          regionCoordinator: {
            connectOrCreate: {
              create: {
                name: input.regionCoordinator.name,
                phone: input.regionCoordinator.phone,
              },
              where: {
                id: input.regionCoordinator.id,
              },
            },
          },
          contingentAddress: {
            city: input.city,
            province: input.province,
          },
          bookingCode: `${input.city.name}_${prefixWithZeros(cityCount + 1)}`,
          contingentLeader: {
            name: input.contingent[0].coordinator.name,
            phone: input.contingent[0].coordinator.phone,
          },
          contingentVechile: input.contingent[0].vechileType,
          personCount: input.contingent[0].personCount,
        },
      });

      return booking;
    }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
