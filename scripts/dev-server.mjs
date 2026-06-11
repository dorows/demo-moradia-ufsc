import http from "node:http";
import { getListings } from "../lib/olx.js";

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/listings")) {
    try {
      const result = await getListings();
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`API dev server: http://localhost:${PORT}/api/listings`);
});
