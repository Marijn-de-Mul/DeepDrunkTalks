// app/routes/proxy.tsx

import { ActionFunction, json } from "@remix-run/node";
import fetch from "node-fetch";

export let action: ActionFunction = async ({ request }) => {
  try {
    // Parse the incoming JSON body
    const requestData = await request.json();

    const { method, apiPath, body } = requestData;

    // Check if method and apiPath are provided
    if (!method || !apiPath) {
      return json({ error: "Missing method or API path" }, { status: 400 });
    }

    // Backend URL based on environment (production or development)
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? "http://backend:8079"
        : "http://localhost:8080";

    // Send the request to the backend
    const response = await fetch(`${backendUrl}${apiPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(JSON.parse(body)) : undefined, // Only include body for POST/PUT requests
    });

    // Handle errors from the backend
    if (!response.ok) {
      const errorData = await response.json();
      return json(errorData, { status: response.status });
    }

    // Return the response from the backend to the client
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error while processing proxy request:", error);
    return json({ error: "Server error while processing request" }, { status: 500 });
  }
};
