import { ActionFunction } from "@remix-run/node";
import fetch from "node-fetch";

const BASE_URL = process.env.NODE_ENV === "production"
  ? "http://ddt_backend:8079"
  : process.env.NODE_ENV === "test"
    ? "http://ddt_backend_staging:8077"
    : "http://localhost:8079";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const endpoint = formData.get("endpoint");
  const authorization = request.headers.get("authorization");

  if (!endpoint || !authorization) {
    console.error("Missing required parameters: endpoint or authorization");
    return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
  }

  const endpointString = endpoint.toString();
  const normalizedEndpoint = endpointString.startsWith('/') ? endpointString : `/${endpointString}`;
  const targetUrl = `${BASE_URL}${normalizedEndpoint}`;
  console.log(`Fetching audio from: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Authorization": authorization,
      },
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch audio: ${response.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: `Failed to fetch audio: ${response.statusText}` }), { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const data = await response.buffer();

    console.log(`Successfully fetched audio. Content-Type: ${contentType}, Size: ${data.length} bytes`);

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error: any) {
    console.error("Error fetching audio:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
