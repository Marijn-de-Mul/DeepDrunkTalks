import { json, type ActionFunction } from "@remix-run/node";
import fetch from "node-fetch";

const BASE_URL = process.env.NODE_ENV === "production" ? "http://backend:8079" : "http://localhost:8079";

export const action: ActionFunction = async ({ request }) => {
  const { endpoint, method, authorization, body, contentType } = await request.json();

  const url = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Authorization": `Bearer ${authorization}`,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  } else {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
    ...(method !== "GET" && method !== "HEAD" ? { body: JSON.stringify(body) } : {}),
  };

  console.log("Proxy request to:", url);
  console.log("Options:", options);

  try {
    const response = await fetch(url, options as import("node-fetch").RequestInit);

    console.log("Proxy response status:", response.status);

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const text = await response.text();
    console.log("Proxy response text:", text);

    let data;
    const responseContentType = response.headers.get("content-type");
    if (responseContentType && responseContentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = { message: text };
      }
    } else {
      data = { message: text };
    }

    return json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
