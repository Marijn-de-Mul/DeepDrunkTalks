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
  
  try {
    console.log('Audio type:', audio instanceof Blob);
    console.log('Audio size:', audio instanceof Blob ? audio.size : 'N/A');
    const proxyFormData = new FormData();
    if (audio instanceof Blob) {
      proxyFormData.append("audio", audio, "audio.webm");
    } else if (typeof audio === 'string') {
      proxyFormData.append("audio", new Blob([audio]), "audio.webm");
    } else {
      throw new Error("Invalid audio format");
    }
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authorization}`,
      },
      body: proxyFormData
    });

    if (!response.ok) {
      console.error('Upload failed:', response.status);
      return json({ error: "Failed to upload audio" }, { status: response.status });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Audio upload error:", error);
    return json({ error: String(error) }, { status: 500 });
  }
};
