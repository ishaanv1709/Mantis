/** Public runtime config shared across client + server. */
export const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:8000";

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

/** Clerk is optional in dev: when no real publishable key is present the app
 *  renders in guest mode so it can still be opened and demoed. */
export const CLERK_ENABLED = pk.startsWith("pk_") && !pk.includes("placeholder");
