"use client";

import { useEffect, useState } from "react";
import { TImageFile } from "@/actions/schemas";
import InputImage from "../../public/image-control-input.png";
import InputMask from "../../public/image-control-input-mask.png";
import { Loader2 } from "lucide-react";

interface FileUploadItem extends TImageFile {
  status: "pending" | "success" | "error";
}

export default function GenerateImageTest() {
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

  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!start) return;

    const body = new FormData();

    body.append("prompt", "Snowy wasteland. Castle ruins in the distance.");
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
    fetch("api/hello", {
      method: "POST",
      body,
    })
      .then((response) => response.text())
      .then((result) => setResultImage(`data:image/png;base64,${result}`))
      .finally(() => setStart(false))
      .catch(() => setStart(false));
    // .then((response) => response.json())
    // .then((result) => setResultImage(`data:image/png;base64,${result}`))
    // .finally(() => setStart(false))
    // .catch(() => setStart(false));
  }, [start]);

  const handleSubmit = () => {
    setStart(true);
  };

  useEffect(() => {
    console.log("IMG: ", resultImage);
  }, [resultImage]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <input type="text" id="prompt" />
      <button disabled={start}>GENERATE</button>
      {start ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="max-w-screen-sm">
          <img
            src={resultImage}
            alt="generated image"
            className="object-contain w-full"
          />
        </div>
      )}
    </form>
  );
}
