import { ActionFunction, json } from "@remix-run/node";
import fetch from "node-fetch"; 

export let action: ActionFunction = async ({ request }) => {
  try {
    const formData = new URLSearchParams(await request.text());
    const method = formData.get("method"); 
    const apiPath = formData.get("apiPath"); 
    const body = formData.get("body"); 

    if (!method || !apiPath) {
      return json({ error: "Missing method or API path" }, { status: 400 });
    }

    const backendUrl =
      process.env.NODE_ENV === "production"
        ? "http://backend:8079" 
        : "http://localhost:8080"; 

    const response = await fetch(`${backendUrl}${apiPath}`, {
      method, 
      headers: {
        "Content-Type": "application/json",
      },
      body: method !== "GET" ? JSON.stringify(JSON.parse(body)) : undefined, 
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json(errorData, { status: response.status });
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error while processing proxy request:", error);
    return json({ error: "Server error while processing request" }, { status: 500 });
  }
};
