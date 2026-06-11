import { gotScraping } from "got-scraping";

const ALLOWED_HOST = "img.olx.com.br";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method not allowed");
  }

  const rawUrl = req.query?.url;
  if (!rawUrl) {
    return res.status(400).end("Missing url");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).end("Invalid url");
  }

  if (parsed.hostname !== ALLOWED_HOST || parsed.protocol !== "https:") {
    return res.status(403).end("Forbidden");
  }

  try {
    const response = await gotScraping({
      url: parsed.toString(),
      responseType: "buffer",
      timeout: { request: 8000 },
    });

    res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).send(response.body);
  } catch {
    return res.status(502).end("Failed to fetch image");
  }
}
