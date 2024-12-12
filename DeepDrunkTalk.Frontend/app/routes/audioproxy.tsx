import { json, type ActionFunction } from "@remix-run/node";
import fetch from "node-fetch";

const BASE_URL = process.env.NODE_ENV === "production" ? "http://backend:8079" : "http://localhost:8079";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const endpoint = formData.get("endpoint");
  const method = formData.get("method");
  const authorization = formData.get("authorization");
  const audio = formData.get("audio");

  if (!endpoint || !method || !authorization) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  const targetUrl = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Authorization": `Bearer ${authorization}`,
  };

  const proxyFormData = new FormData();
  if (audio) {
    proxyFormData.append("audio", audio as Blob, "audio.webm");
  } else {
    return json({ error: "Missing audio file" }, { status: 400 });
  }

  const options: RequestInit = {
    method: method as string,
    headers,
    body: proxyFormData,
  };

  console.log("Proxy request to:", targetUrl);
  console.log("Options:", options);

  try {
    const response = await fetch(targetUrl, options as import("node-fetch").RequestInit);

    console.log("Proxy response status:", response.status);

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const audioBlob = await response.blob();
    return new Response(audioBlob, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "audio/webm",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
