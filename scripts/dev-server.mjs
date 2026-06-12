import http from "node:http";
import { getListings } from "../lib/olx.js";
import rerankHandler from "../api/rerank.js";

const PORT = 3000;

function readBody(req) {
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

function createMockRes(res) {
  let statusCode = 200;
  const headers = {};

  return {
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      res.writeHead(statusCode, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    },
  };
}

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

  if (req.url?.startsWith("/api/rerank") && req.method === "POST") {
    try {
      req.body = await readBody(req);
      await rerankHandler(req, createMockRes(res));
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
  console.log(`API dev server: http://localhost:${PORT}`);
  console.log(`  GET  /api/listings`);
  console.log(`  POST /api/rerank`);
});
