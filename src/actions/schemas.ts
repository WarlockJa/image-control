import { z } from "zod";

export const generateImageSchema = z.object({
  prompt: z.string(),
});
