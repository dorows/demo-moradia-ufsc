import {
  rerankListings,
  RerankUnavailableError,
  RerankRateLimitError,
} from "../lib/ai/rerank-listings.js";

function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === "string" && req.body) {
    return Promise.resolve(JSON.parse(req.body));
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    const { query, listings } = body;

    if (!Array.isArray(listings)) {
      return res.status(400).json({ error: "listings must be an array" });
    }

    const result = await rerankListings(query, listings);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof RerankUnavailableError) {
      return res.status(503).json({ error: error.message });
    }
    if (error instanceof RerankRateLimitError) {
      return res.status(429).json({ error: error.message });
    }

    return res.status(500).json({
      error: "Failed to rerank listings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
