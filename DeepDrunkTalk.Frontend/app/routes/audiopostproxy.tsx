import { json, type ActionFunction } from "@remix-run/node";
import fetch from "node-fetch";

const BASE_URL = process.env.NODE_ENV === "production" ? "http://backend:8079" : "http://localhost:8079";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const endpoint = formData.get("endpoint");
  const authorization = formData.get("authorization");
  const audio = formData.get("audio");

  if (!endpoint || !authorization || !audio) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  const targetUrl = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Authorization": `Bearer ${authorization}`,
  };

  const proxyFormData = new FormData();
  proxyFormData.append("audio", audio as Blob, "audio.webm");

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: proxyFormData,
    } as import("node-fetch").RequestInit);

    console.log("Audio upload status:", response.status);

    if (!response.ok) {
      return json({ error: "Failed to upload audio" }, { status: response.status });
    }

    return json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Audio upload error:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
