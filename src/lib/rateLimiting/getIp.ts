import { headers } from "next/headers";

export async function getIp() {
  const headersData = await headers();
  const forwardedFor = headersData.get("x-forwarded-for");
  const realIp = headersData.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}
