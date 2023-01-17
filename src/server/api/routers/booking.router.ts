import { ContingentVechileType, type Booking } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const bookingCreateInput = z
  .array(
    z
      .object({
        name: z.string(),
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

      const bookingCodePrefix = `${input.contingent[0].name}_${input.city.name}`;
      const bookingCodeCount = await ctx.prisma.booking.aggregate({
        _count: {
          id: true,
        },
        where: {
          contingentName: {
            contains: bookingCodePrefix,
          },
        },
      });
      const bookingCode = `${bookingCodePrefix}_${prefixWithZeros(
        bookingCodeCount._count.id + 1
      )}`;

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
        bookingCode,
        contingentLeader: {
          name: input.contingent[0].coordinator.name,
          phone: input.contingent[0].coordinator.phone,
        },
        contingentVechile: input.contingent[0].vechileType,
        contingentName: input.contingent[0].name,
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

  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: {
          id: input.id,
        },
        include: {
          regionCoordinator: true,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      return booking;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
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
      if (input.contingent.length > 1) {
        throw new Error("Multiple contingents not supported yet");
      }

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
        contingentLeader: {
          name: input.contingent[0].coordinator.name,
          phone: input.contingent[0].coordinator.phone,
        },
        contingentVechile: input.contingent[0].vechileType,
        personCount: input.contingent[0].personCount,
      };
      let booking: Booking | undefined = undefined;

      if (input.regionCoordinator.id) {
        booking = await ctx.prisma.booking.update({
          where: {
            id: input.id,
          },
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
        booking = await ctx.prisma.booking.update({
          where: {
            id: input.id,
          },
          data: {
            ...data,
          },
        });
      }

      return booking;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const booking = await ctx.prisma.booking.delete({
        where: {
          id: input.id,
        },
      });

      return booking;
    }),

  filterContingentName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const contingentNames = await ctx.prisma.booking.findMany({
        where: {
          contingentName: {
            contains: input.name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          contingentName: true,
        },
      });

      return contingentNames;
    }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
