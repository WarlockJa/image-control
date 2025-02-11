"use server";

// import { rateLimitByIp } from "@/lib/rateLimiting/limiters";
import { actionClient } from "@/lib/safeAction";
import { generateImageSchema } from "./schemas";
import { rateLimitByIp } from "@/lib/rateLimiting/limiters";
import { CWImgGeneration } from "@cf/CWImgGeneration";
import { env } from "@/lib/env.mjs";

// add location to the database
export const generateImageAction = actionClient
  .schema(generateImageSchema)
  .action(async ({ parsedInput: { prompt, image, mask, width, height } }) => {
    await rateLimitByIp({
      key: "locations",
      limit: 10,
      window: 60 * 1000,
    });

    const isDev = process.env.NODE_ENV === "development";

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

    // return new Response(response.body, {
    //   headers: {
    //     "Content-Type": "image/png", // Adjust based on the image type
    //   },
    // });

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

    // Return the base64-encoded image
    return { image: base64Image };
  });
