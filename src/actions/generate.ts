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
  .action(async ({ parsedInput: { prompt } }) => {
    await rateLimitByIp({
      key: "locations",
      limit: 30,
      window: 60000,
    });

    const body = new FormData();
    body.append("prompt", prompt);

    const response = await CWImgGeneration.fetch(
      env.NEXT_PUBLIC_IMAGE_GENERATE_WORKER_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "x-access-key": env.NEXT_PUBLIC_ACCESS_KEY,
          "Access-Control-Allow-Origin": "*",
        },
        body,
      }
    );

    if (!response.ok || !response.body)
      throw new Error("Image generation failed");

    return { image: response.text() };

    // // fetching image creating input object for image caption AI
    // const inputs = {
    //   prompt,
    //   // image: [...new Uint8Array(await exampleInputImage.arrayBuffer())],
    //   // mask: [...new Uint8Array(await exampleMask.arrayBuffer())],
    // };

    // // const response = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-inpainting', inputs);
    // const response = await ai.run("@cf/lykon/dreamshaper-8-lcm", inputs);

    // const reader = response.getReader();

    // // Collect chunks of data
    // const chunks = [];
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) break; // Exit the loop when the stream is complete
    //   chunks.push(value); // Add the chunk to the array
    // }

    // // Combine the chunks into a single Uint8Array
    // const concatenatedChunks = new Uint8Array(
    //   chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    // );
    // let offset = 0;
    // for (const chunk of chunks) {
    //   concatenatedChunks.set(chunk, offset);
    //   offset += chunk.length;
    // }

    // // Convert the Uint8Array to a base64-encoded string
    // const base64Image = Buffer.from(concatenatedChunks).toString("base64");

    // const result = fs.writeFileSync(
    //   "./generatedimage.webp",
    //   Buffer.from(concatenatedChunks)
    // );

    // Return the base64-encoded image
    // return { image: base64Image };
  });
