const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");

const renderClubs = (res, data) => {
  const filePath = path.join(
    __dirname,
    "../../views/pages/clubs.ejs"
  );

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
const getClubs = (req, res) => {
  pool.query(
    "SELECT * FROM clubs ORDER BY id",
    (err, result) => {
      if (err) {
        console.error(err);
        return res.end("Database error");
      }

      renderClubs(res, {
        title: "Clubs",
        clubs: result.rows,
      });
    }
  );
};

// CREATE
const createClub = (req, res) => {
  const { name, contact_email, contact_phone } = req.body;

  const sql = `
    INSERT INTO clubs (name, contact_email, contact_phone)
    VALUES ($1, $2, $3)
  `;

  pool.query(
    sql,
    [name, contact_email, contact_phone],
    (err) => {
      if (err) {
        console.error(err);
        return res.end("Database error");
      }

      res.writeHead(302, {
        Location: "/clubs",
      });

      res.end();
    }
  );
};

// UPDATE
const updateClub = (req, res) => {
  const { id, name, contact_email, contact_phone } = req.body;

  const sql = `
    UPDATE clubs
    SET name = $1,
        contact_email = $2,
        contact_phone = $3
    WHERE id = $4
  `;

  pool.query(
    sql,
    [name, contact_email, contact_phone, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.end("Database error");
      }

      res.writeHead(302, {
        Location: "/clubs",
      });

      res.end();
    }
  );
};

// DELETE
const deleteClub = (req, res) => {
  const { id } = req.body;

  pool.query(
    "DELETE FROM clubs WHERE id = $1",
    [id],
    (err) => {
      if (err) {
        console.error(err);
        return res.end("Database error");
      }

      res.writeHead(302, {
        Location: "/clubs",
      });

      res.end();
    }
  );
};

module.exports = {
  getClubs,
  createClub,
  updateClub,
  deleteClub,
};