const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");

const renderFacilities = (res, data) => {
  const filePath = path.join(__dirname, "../../views/pages/facilities.ejs");

  ejs.renderFile(filePath, data, (err, html) => {
    if (err) {
      console.error(err);

      res.writeHead(500, {
        "Content-Type": "text/plain",
      });

      return res.end("Internal Server Error");
    }

    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(html);
  });
};

// READ
const getFacilities = (req, res) => {
  pool.query("SELECT * FROM facilities ORDER BY id", (err, result) => {
    if (err) {
      console.error(err);
      return res.end("Database error");
    }

    renderFacilities(res, {
      title: "Facilities",
      facilities: result.rows,
    });
  });
};

// CREATE
const createFacility = (req, res) => {
  const { name, type, address, erp_capacity } = req.body;

  const sql = `
    INSERT INTO facilities (name, type, address, erp_capacity)
    VALUES ($1, $2, $3, $4)
  `;

  pool.query(sql, [name, type, address, erp_capacity], (err) => {
    if (err) {
      console.error(err);
      return res.end("Database error");
    }

    res.writeHead(302, {
      Location: "/facilities",
    });

    res.end();
  });
};

// UPDATE
const updateFacility = (req, res) => {
  const { id, name, type, address, erp_capacity } = req.body;

  const sql = `
    UPDATE facilities
    SET name = $1,
        type = $2,
        address = $3,
        erp_capacity = $4
    WHERE id = $5
  `;

  pool.query(sql, [name, type, address, erp_capacity, id], (err) => {
    if (err) {
      console.error(err);
      return res.end("Database error");
    }

    res.writeHead(302, {
      Location: "/facilities",
    });

    res.end();
  });
};

// DELETE
const deleteFacility = (req, res) => {
  const { id } = req.body;

  pool.query("DELETE FROM facilities WHERE id = $1", [id], (err) => {
    if (err) {
      console.error(err);
      return res.end("Database error");
    }

    res.writeHead(302, {
      Location: "/facilities",
    });

    res.end();
  });
};

module.exports = {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
};
