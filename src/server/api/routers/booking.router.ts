import { ContingentVechileType } from "@prisma/client";
import { log } from "console";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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
        province: z.string(),
        city: z.string(),
        contingent: z.array(
          z.object({
            personCount: z.number().positive(),
            vechileType: z.enum([
              ContingentVechileType.BUS,
              ContingentVechileType.CAR,
              ContingentVechileType.TRUCK,
            ]),
            coordinator: z.object({
              name: z.string(),
              phone: z.string(),
            }),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cityCount = await ctx.prisma.booking.count({
        where: {
          contingentAddress: {
            is: {
              city: input.city,
            },
          },
        },
      });

      log({ cityCount });

      // const booking = await ctx.prisma.booking.create({
      //   data: {
      //     booker: {
      //       name: input.booker.name,
      //       phone: input.booker.phone,
      //     },
      //     regionCoordinator: {
      //       connectOrCreate: {
      //         create: {
      //           name: input.regionCoordinator.name,
      //           phone: input.regionCoordinator.phone,
      //           id: input.regionCoordinator.id,
      //         },
      //         where: {
      //           id: input.regionCoordinator.id,
      //         },
      //       },
      //     },
      //     contingentAddress: {
      //       city: input.city,
      //       province: input.province,
      //     },
      //     bookingCode: `${input.city}_`

      //   },
      // });

      return {
        greeting: `Hello`,
      };
    }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
