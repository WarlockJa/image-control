import { getRequestContext } from "@cloudflare/next-on-pages";

export const CWImgGeneration =
  process.env.NODE_ENV === "development"
    ? getRequestContext().env.CWImgGeneration
    : (process.env as unknown as CloudflareEnv).CWImgGeneration;
