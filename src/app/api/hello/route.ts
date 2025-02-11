// import { getRequestContext } from '@cloudflare/next-on-pages'

import { env } from "@/lib/env.mjs";
import { CWImgGeneration } from "@cf/CWImgGeneration";
import { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";

export async function GET() {
  console.log("Hello World");

  return new Response("Hello World!");
}

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

const testGenerateSchema = z.object({
  prompt: z.string(),
  image: fileSchema.optional(),
  mask: fileSchema.optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});

export async function POST(request: NextRequest) {
  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
  //    - https://developers.cloudflare.com/pages/functions/bindings/
  // )
  //
  // KV Example:
  // const myKv = getRequestContext().env.MY_KV_NAMESPACE
  // await myKv.put('suffix', ' from a KV store!')
  // const suffix = await myKv.get('suffix')
  // return new Response(responseText + suffix)

  const isDev = process.env.NODE_ENV === "development";
  const bodyData = await request.formData();
  const parsedInput = testGenerateSchema.safeParse(
    Object.fromEntries(bodyData)
  );

  if (!parsedInput.success)
    return new Response("Invalid input data", { status: 400 });
  const { prompt, height, image, mask, width } = parsedInput.data;
  const body = new FormData();
  body.append("prompt", prompt);
  if (image) body.append("image", image);
  if (mask) body.append("mask", mask);
  if (width) body.append("width", width.toString());
  if (height) body.append("height", height.toString());
  const response = await CWImgGeneration.fetch(
    isDev ? "http://localhost:8787" : env.IMAGE_GENERATE_WORKER_URL,
    {
      method: "POST",
      headers: {
        "x-access-key": env.ACCESS_KEY,
      },
      body,
    }
  );
  if (!response.ok || !response.body)
    throw new Error("Image generation failed");
  const reader = response.body.getReader();
  // // fetching image creating input object for image caption AI
  // const inputs = {
  //   prompt,
  //   // image: [...new Uint8Array(await exampleInputImage.arrayBuffer())],
  //   // mask: [...new Uint8Array(await exampleMask.arrayBuffer())],
  // };
  // // const response = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-inpainting', inputs);
  // const response = await ai.run("@cf/lykon/dreamshaper-8-lcm", inputs);
  // const reader = response.getReader();
  // Collect chunks of data
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break; // Exit the loop when the stream is complete
    chunks.push(value); // Add the chunk to the array
  }
  // Combine the chunks into a single Uint8Array
  const concatenatedChunks = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    concatenatedChunks.set(chunk, offset);
    offset += chunk.length;
  }
  // Convert the Uint8Array to a base64-encoded string
  const base64Image = Buffer.from(concatenatedChunks).toString("base64");

  // console.log(base64Image);
  // Return the base64-encoded image
  return new Response(base64Image);
}
