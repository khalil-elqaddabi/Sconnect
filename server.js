const http = require("http");
const router = require("find-my-way")();
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

router.on("GET", "/", (req, res, params) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
  });
  res.end("Sconnect Pro Server is running! hello");
});

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    router.lookup(req, res);
    return;
  }
//   ? 
 if (req.method === "POST") {
    let bodyChunks = [];

    req.on("data", (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on("end", () => {
      const body = Buffer.concat(bodyChunks).toString();

      console.log("Received body:", body);

      res.writeHead(200, {
        "Content-Type": "text/plain",
      });

      res.end("POST received successfully");
    });

    return;
  }
//   _

  const sanitizedUrl = path.normalize(req.url).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(PUBLIC_DIR, sanitizedUrl);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });

      return res.end("File not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
    });

    res.end(data);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://mocro.mern:3000");
});
