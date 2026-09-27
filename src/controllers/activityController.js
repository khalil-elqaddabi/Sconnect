const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");

const { validateSchedule } = require("../services/scheduleService");

const renderActivities = (res, data) => {
  const filePath = path.join(
    __dirname,
    "../../views/pages/activities.ejs"
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
const getActivities = async (req, res) => {
  try {
    const activitiesResult = await pool.query(`
      SELECT *
      FROM activities
      ORDER BY id
    `);

    const facilitiesResult = await pool.query(`
      SELECT id, name
      FROM facilities
      ORDER BY name
    `);

    const clubsResult = await pool.query(`
      SELECT id, name
      FROM clubs
      ORDER BY name
    `);

    renderActivities(res, {
      title: "Activities",
      activities: activitiesResult.rows,
      facilities: facilitiesResult.rows,
      clubs: clubsResult.rows,
    });

  } catch (err) {
    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end("Database error");
  }
};

// CREATE
const createActivity = async (req, res) => {
  const {
    name,
    description,
    facility_id,
    club_id,
    max_capacity,
    price,
    age_min,
    age_max,
    day_of_week,
    start_time,
    end_time,
  } = req.body;

  try {
    // Check schedule rules
    const validation = await validateSchedule(
      facility_id,
      day_of_week,
      start_time,
      end_time,
      max_capacity
    );

    if (!validation.valid) {
      res.writeHead(400, {
        "Content-Type": "text/plain",
      });

      return res.end(validation.message);
    }

    // Insert activity
    const sql = `
      INSERT INTO activities (
        name,
        description,
        facility_id,
        club_id,
        max_capacity,
        price,
        age_min,
        age_max,
        day_of_week,
        start_time,
        end_time
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11
      )
    `;

    await pool.query(sql, [
      name,
      description,
      facility_id,
      club_id,
      max_capacity,
      price,
      age_min,
      age_max,
      day_of_week,
      start_time,
      end_time,
    ]);

    res.writeHead(302, {
      Location: "/activities",
    });

    res.end();
  } catch (err) {
    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end("Database error");
  }
};

module.exports = {
  getActivities,
  createActivity,
};