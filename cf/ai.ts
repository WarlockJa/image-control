import { getRequestContext } from "@cloudflare/next-on-pages";

export const ai =
  process.env.NODE_ENV === "development"
    ? getRequestContext().env.AI
    : (process.env as unknown as CloudflareEnv).AI;
