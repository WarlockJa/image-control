"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { LoaderButton } from "./LoaderButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateImageSchema, TImageFile } from "@/actions/schemas";
import InputImage from "../../public/image-control-input.png";
import InputMask from "../../public/image-control-input-mask.png";

interface FileUploadItem extends TImageFile {
  status: "pending" | "success" | "error";
}

export default function GenerateImageTemp() {
  const [image, setImage] = useState<FileUploadItem>();
  const [mask, setMask] = useState<FileUploadItem>();

  useEffect(() => {
    // adding default image
    fetch(InputImage.src)
      .then((response) => response.blob())
      .then((result) =>
        setImage({
          file: new File([result], "image.png", { type: "image/png" }),
          status: "success",
        })
      );
    // adding default mask
    fetch(InputMask.src)
      .then((response) => response.blob())
      .then((result) =>
        setMask({
          file: new File([result], "mask.png", { type: "image/png" }),
          status: "success",
        })
      );
  }, []);

  const [resultImage, setResultImage] = useState<string>();

  // magic link
  const form = useForm<z.infer<typeof generateImageSchema>>({
    resolver: zodResolver(generateImageSchema),
    defaultValues: {
      prompt: "",
    },
  });

  function onSubmit(values: z.infer<typeof generateImageSchema>) {
    const body = new FormData();
    body.append("prompt", values.prompt);
    if (
      image &&
      mask &&
      image.status === "success" &&
      mask.status === "success"
    ) {
      body.append("image", image.file);
      body.append("mask", mask.file);
      body.append("width", InputImage.width.toString());
      body.append("height", InputImage.height.toString());
    }
    setResultImage("loading");
    fetch("api/hello", {
      method: "POST",
      body,
    })
      .then((response) => response.text())
      .then((result) => setResultImage(`data:image/png;base64,${result}`));
  }

  const formInputImage = useMemo(
    () => image?.file && window.URL.createObjectURL(image?.file),
    [image?.file]
  );
  const formInputMask = useMemo(
    () => mask?.file && window.URL.createObjectURL(mask?.file),
    [mask?.file]
  );

  return (
    <div className="max-w-screen-md w-screen mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
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

          {/* <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Image</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Select input image"
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files) return;

                      setImage({
                        file: e.target.files[0],
                        status: "pending",
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mask"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Mask</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Select input mask"
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files) return;

                      setMask({
                        file: e.target.files[0],
                        status: "pending",
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <div className="h-96 flex gap-4">
            {image && image.status !== "error" && (
              <img
                src={formInputImage}
                alt="input image"
                onLoad={() =>
                  setImage((prev) =>
                    prev ? { ...prev, status: "success" } : undefined
                  )
                }
                onError={() => {
                  setImage((prev) =>
                    prev ? { ...prev, status: "error" } : undefined
                  );

                  toast("Image Error", {
                    description:
                      "Cannot display input image. Possible reasons unsupported image file or image file is corrupt.",
                  });
                }}
              />
            )}
            {mask && mask.status !== "error" && (
              <img
                src={formInputMask}
                alt="input mask"
                onLoad={() =>
                  setMask((prev) =>
                    prev ? { ...prev, status: "success" } : undefined
                  )
                }
                onError={() => {
                  setMask((prev) =>
                    prev ? { ...prev, status: "error" } : undefined
                  );

                  toast("Mask Error", {
                    description:
                      "Cannot display input image mask. Possible reasons unsupported image file or image file is corrupt.",
                  });
                }}
              />
            )}
          </div>

          <LoaderButton
            isDisabled={image?.status === "pending"}
            isLoading={resultImage === "loading"}
            className="w-full"
          >
            Generate Image
          </LoaderButton>
        </form>
      </Form>
      {resultImage && resultImage !== "loading" && (
        <img
          src={resultImage}
          alt="Generated Image"
          className="object-contain"
        />
      )}
    </div>
  );
}
