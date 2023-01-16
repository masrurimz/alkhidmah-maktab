import { type Booking, ContingentVechileType } from "@prisma/client";
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

      const data = {
        booker: {
          name: input.booker.name,
          phone: input.booker.phone,
        },
        regionCoordinator: {
          create: {
            name: input.regionCoordinator.name,
            phone: input.regionCoordinator.phone,
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
      };
      let booking: Booking | undefined = undefined;

      if (input.regionCoordinator.id) {
        booking = await ctx.prisma.booking.create({
          data: {
            ...data,
            regionCoordinator: {
              connect: {
                id: input.regionCoordinator.id,
              },
            },
          },
        });
      } else {
        booking = await ctx.prisma.booking.create({
          data: {
            ...data,
          },
        });
      }

      return booking;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        skip: z.number().optional().default(0), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit = 50, skip = 0 } = input;

      const items = await ctx.prisma.booking.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        skip: skip ?? 0,
        include: {
          regionCoordinator: true,
        },
      });

      let nextSkip: typeof skip | undefined = undefined;
      if (items.length > limit) {
        nextSkip = skip + limit;
      }

      return {
        items,
        nextSkip,
      };
    }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
