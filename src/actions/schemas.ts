import { z } from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/"];

const fileSchema = z.any().transform((file, ctx) => {
  if (file?.size === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "unsupported image type",
    });

    return z.NEVER;
  } else {
    // testing for max size
    if (file?.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `max image size is ${Math.floor(MAX_FILE_SIZE / 1000000)}MB`,
      });

      return z.NEVER;
    }
    // testing for image type
    if (!ACCEPTED_IMAGE_TYPES.includes(file?.type.slice(0, 6))) {
      // console.log(file.type);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "unsupported image type",
      });
      return z.NEVER;
    }

    return file as File;
  }
});

export const imageFileSchema = z.object({
  file: fileSchema,
});

export type TImageFile = z.infer<typeof imageFileSchema>;

export const generateImageSchema = z.object({
  prompt: z.string(),
  image: fileSchema.optional(),
  mask: fileSchema.optional(),
  // image: imageFileSchema.optional(),
  // mask: imageFileSchema.optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
