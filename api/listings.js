import { getListings } from "../lib/olx.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await getListings();

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    res.setHeader("Content-Type", "application/json");

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch listings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
