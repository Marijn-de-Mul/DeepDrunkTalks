import { json, type ActionFunction } from "@remix-run/node";
import fetch from "node-fetch";

const BASE_URL = process.env.NODE_ENV === "production"
  ? "http://backend:8079"
  : process.env.NODE_ENV === "test"
    ? "http://backend:8077"
    : "http://localhost:8079";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const endpoint = formData.get("endpoint");
  const authorization = request.headers.get("authorization");

  if (!endpoint || !authorization) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  const targetUrl = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Authorization": authorization,
  };

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    } as import("node-fetch").RequestInit);

    console.log("Audio fetch status:", response.status);

    if (!response.ok) {
      return json({ error: "Failed to fetch audio" }, { status: response.status });
    }

    const audioBlob = await response.blob();
    return new Response(audioBlob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Audio fetch error:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
