import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublic = createRouteMatcher([
  "/", // landing page
  "/form/(.*)", // public form pages with any slug
  "/api/forms/(.*)", // all form API endpoints (GET schema, POST submit)
  "/api/health-check", // health check endpoint
  "/sign-in(.*)", // Clerk sign-in pages
  "/sign-up(.*)", // Clerk sign-up pages
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect non-public routes
  if (!isPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip all paths with file extensions and _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/", // include root
    "/(api|trpc)(.*)", // include all API routes
  ],
};
