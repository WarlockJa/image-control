"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { LoaderButton } from "./LoaderButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateImageSchema } from "@/actions/schemas";
import { generateImageAction } from "@/actions/generate";

export default function GenerateImage() {
  const [image, setImage] = useState<string>();
  const { execute, status } = useAction(generateImageAction, {
    onError({ error }) {
      if (error.serverError === "RateLimitError") {
        toast("Rate limit error", {
          description: "Too many attempts, try again later",
        });

        return;
      }

      toast("Something went wrong", { description: JSON.stringify(error) });
    },

    onSuccess({ data, input }) {
      toast("Generated new image:", {
        description: input.prompt,
      });

      if (data?.image) setImage(`data:image/png;base64,${data.image}`);
    },
  });

  // magic link
  const form = useForm<z.infer<typeof generateImageSchema>>({
    resolver: zodResolver(generateImageSchema),
    defaultValues: {
      prompt: "",
    },
  });

  function onSubmit(values: z.infer<typeof generateImageSchema>) {
    execute(values);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>image prompt:</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full"
                    placeholder="image prompt"
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoaderButton
            isDisabled={status === "executing"}
            isLoading={status === "executing"}
            className="w-full"
          >
            Generate Image
          </LoaderButton>
        </form>
      </Form>
      {image && <img src={image} alt="Generated Image" />}
    </>
  );
}
