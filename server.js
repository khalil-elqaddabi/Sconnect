const http = require("http");
const router = require("find-my-way")();
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} = require("./src/controllers/facilityController");

const {
  getClubs,
  createClub,
  updateClub,
  deleteClub,
} = require("./src/controllers/clubController");

const {
  getActivities,
  createActivity,
} = require("./src/controllers/activityController");

const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} = require("./src/controllers/memberController");
const {
  getCheckout,
  calculateCheckout,
} = require("./src/controllers/checkoutController");
const {
  createRegistration,
  getRegistrations,
  cancelRegistration,
} = require("./src/controllers/registrationController");

const { getDashboard } = require("./src/controllers/homeController");

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

router.on("GET", "/", getDashboard);
// facilities
router.on("GET", "/facilities", getFacilities);
router.on("POST", "/facilities", createFacility);
router.on("POST", "/facilities/update", updateFacility);
router.on("POST", "/facilities/delete", deleteFacility);

// -- clubs
router.on("GET", "/clubs", getClubs);
router.on("POST", "/clubs", createClub);
router.on("POST", "/clubs/update", updateClub);
router.on("POST", "/clubs/delete", deleteClub);

// activities
router.on("GET", "/activities", getActivities);
router.on("POST", "/activities", createActivity);

// members
router.on("GET", "/members", getMembers);
router.on("POST", "/members", createMember);
router.on("POST", "/members/update", updateMember);
router.on("POST", "/members/delete", deleteMember);

// checkout
router.on("GET", "/checkout", getCheckout);
router.on("POST", "/checkout", calculateCheckout);

// registration
router.on("POST", "/registrations", createRegistration);
router.on("GET", "/registrations", getRegistrations);
router.on("POST", "/registrations/cancel", cancelRegistration);

const server = http.createServer((req, res) => {
  //   ?
  if (req.method === "POST") {
    let bodyChunks = [];

    req.on("data", (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on("end", () => {
      const body = Buffer.concat(bodyChunks).toString();

      req.body = Object.fromEntries(new URLSearchParams(body));

      router.lookup(req, res);
    });

    return;
  }
  if (req.method === "GET") {
    const route = router.find(req.method, req.url);

    if (route) {
      router.lookup(req, res);
      return;
    }

    const sanitizedUrl = path
      .normalize(req.url)
      .replace(/^(\.\.(\/|\\|$))+/, "");

    const filePath = path.join(PUBLIC_DIR, sanitizedUrl);

    fs.readFile(filePath, (err, data) => {

  if (err) {

    const errorPath = path.join(
      __dirname,
      "views/pages/error.ejs"
    );

    return ejs.renderFile(
      errorPath,
      {
        title: "404 - Page Not Found",
        statusCode: 404,
        message: "The page you are looking for does not exist.",
      },
      (error, html) => {

        if (error) {

          res.writeHead(500, {
            "Content-Type": "text/plain",
          });

          return res.end(
            "Internal Server Error"
          );
        }

        res.writeHead(404, {
          "Content-Type": "text/html",
        });

        res.end(html);
      }
    );
  }

  const ext =
    path.extname(filePath).toLowerCase();

  const contentType =
    MIME_TYPES[ext] ||
    "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
  });

  res.end(data);

});

    return;
  }

  res.writeHead(405, {
    "Content-Type": "text/plain",
  });

  res.end("Method Not Allowed");
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
