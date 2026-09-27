const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");


// ========================================
// Render Members
// ========================================

const renderMembers = (res, data) => {

  const filePath = path.join(
    __dirname,
    "../../views/pages/members.ejs"
  );

  ejs.renderFile(
    filePath,
    data,
    (err, html) => {

      if (err) {
        console.error(err);

        res.writeHead(500, {
          "Content-Type": "text/plain",
        });

        return res.end(
          "Internal Server Error"
        );
      }

      res.writeHead(200, {
        "Content-Type": "text/html",
      });

      res.end(html);
    }
  );
};


// ========================================
// READ
// ========================================

const getMembers = async (req, res) => {

  try {

    const membersResult = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        birth_date,
        medical_certificate_valid_until,
        family_id
      FROM members
      ORDER BY id
    `);


    const familiesResult = await pool.query(`
      SELECT
        id,
        name
      FROM families
      ORDER BY name
    `);


    renderMembers(res, {

      title: "Members",

      members:
        membersResult.rows,

      families:
        familiesResult.rows,

    });

  } catch (err) {

    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end(
      "Database error"
    );
  }
};


// ========================================
// CREATE
// ========================================

const createMember = async (req, res) => {

  const {
    first_name,
    last_name,
    birth_date,
    medical_certificate_valid_until,
    family_id,
  } = req.body;


  try {

    const sql = `
      INSERT INTO members (
        first_name,
        last_name,
        birth_date,
        medical_certificate_valid_until,
        family_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
    `;


    await pool.query(
      sql,
      [
        first_name,
        last_name,
        birth_date,
        medical_certificate_valid_until || null,
        family_id || null,
      ]
    );


    res.writeHead(302, {
      Location: "/members",
    });

    res.end();

  } catch (err) {

    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end(
      "Database error"
    );
  }
};


// ========================================
// UPDATE
// ========================================

const updateMember = async (req, res) => {

  const {
    id,
    first_name,
    last_name,
    birth_date,
    medical_certificate_valid_until,
    family_id,
  } = req.body;


  try {

    const sql = `
      UPDATE members
      SET
        first_name = $1,
        last_name = $2,
        birth_date = $3,
        medical_certificate_valid_until = $4,
        family_id = $5
      WHERE id = $6
    `;


    await pool.query(
      sql,
      [
        first_name,
        last_name,
        birth_date,
        medical_certificate_valid_until || null,
        family_id || null,
        id,
      ]
    );


    res.writeHead(302, {
      Location: "/members",
    });

    res.end();

  } catch (err) {

    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end(
      "Database error"
    );
  }
};


// ========================================
// DELETE
// ========================================

const deleteMember = async (req, res) => {

  const { id } = req.body;


  try {

    await pool.query(
      `
        DELETE FROM members
        WHERE id = $1
      `,
      [id]
    );


    res.writeHead(302, {
      Location: "/members",
    });

    res.end();

  } catch (err) {

    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end(
      "Database error"
    );
  }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {

  getMembers,

  createMember,

  updateMember,

  deleteMember,

};