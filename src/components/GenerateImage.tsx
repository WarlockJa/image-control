"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
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
import { generateImageSchema, TImageFile } from "@/actions/schemas";
import { generateImageAction } from "@/actions/generate";
import InputImage from "../../public/image-control-input.png";
import InputMask from "../../public/image-control-input-mask.png";

interface FileUploadItem extends TImageFile {
  status: "pending" | "success" | "error";
}

export default function GenerateImage() {
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

      // console.log(data);
      // console.log(JSON.stringify(data));

      if (data?.image) setResultImage(`data:image/png;base64,${data.image}`);
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
    execute({
      ...values,
      image:
        image && mask && image.status === "success" && mask.status === "success"
          ? image.file
          : undefined,
      mask:
        image && mask && image.status === "success" && mask.status === "success"
          ? mask.file
          : undefined,
      width: InputImage.width,
      height: InputImage.height,
    });
  }

  // checking added files for being a proper image via <img> element
  // adding width and height to the execute data object
  // useEffect(() => {
  //   if(!image) return
  //       const img = new Image();

  //       img.src = window.URL.createObjectURL(image.file);

  //       img.onload = () => {
  //         setFileList((prev) =>
  //           prev.map((entry) =>
  //             entry.file.name === item.file.name
  //               ? {
  //                   file: item.file,
  //                   status: "success",
  //                   height: img.height,
  //                   width: img.width,
  //                 }
  //               : entry
  //           )
  //         );
  //         setExecuteFlag((prev) => prev + 1);
  //       };
  //       img.onerror = () => {
  //         setFileList((prev) =>
  //           prev.map((entry) =>
  //             entry.file.name === item.file.name
  //               ? { file: item.file, status: "error", height: 0, width: 0 }
  //               : entry
  //           )
  //         );
  //         setExecuteFlag((prev) => prev + 1);
  //       };
  //     });
  // }, [image]);

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
            isDisabled={status === "executing" || image?.status === "pending"}
            isLoading={status === "executing"}
            className="w-full"
          >
            Generate Image
          </LoaderButton>
        </form>
      </Form>
      {resultImage && (
        <img
          src={resultImage}
          alt="Generated Image"
          className="object-contain"
        />
      )}
    </div>
  );
}
