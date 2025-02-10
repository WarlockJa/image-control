// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    STABILITY_API_KEY: z.string().min(1),
    STABILITY_CONTROL_URL: z.string().min(1),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    IMAGE_GENERATE_WORKER_URL: z.string().min(1),
    ACCESS_KEY: z.string().min(1),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    STABILITY_API_KEY: process.env.STABILITY_API_KEY,
    STABILITY_CONTROL_URL: process.env.STABILITY_CONTROL_URL,
    IMAGE_GENERATE_WORKER_URL: process.env.IMAGE_GENERATE_WORKER_URL,
    ACCESS_KEY: process.env.ACCESS_KEY,
  },
});
