import { createTRPCRouter } from "./trpc";
import { bookingRouter } from "./routers/booking.router";
import { masterRegionRouter } from "./routers/masterRegion.router";
import { regionCoordinatorRouter } from "./routers/regionCoordinator.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  masterRegion: masterRegionRouter,
  regionCoordinator: regionCoordinatorRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
