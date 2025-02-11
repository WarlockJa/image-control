import GenerateImage from "@/components/GenerateImage";
import GenerateImageTemp from "@/components/GenerateImageTemp";

export const runtime = "edge";

export default function Home() {
  return (
    <>
      <h1>Image control using mask</h1>
      <h2>Server Action</h2>
      <GenerateImageTemp />
      <h2>API route</h2>
      <GenerateImage />
    </>
  );
}
