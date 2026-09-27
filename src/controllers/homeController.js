const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");

const getDashboard = async (req, res) => {
  try {

    // Get occupancy
    const activitiesResult = await pool.query(`
      SELECT
        a.id,
        a.name,
        a.max_capacity,
        COUNT(r.id) AS registered_members,
        ROUND(
          COUNT(r.id) * 100.0 / NULLIF(a.max_capacity, 0),
          2
        ) AS occupancy_percentage
      FROM activities a
      LEFT JOIN registrations r
        ON r.activity_id = a.id
        AND r.status IN (
          'confirmed',
          'medical_non_compliant'
        )
      GROUP BY
        a.id,
        a.name,
        a.max_capacity
      ORDER BY a.id
    `);


    // Get revenue
    const revenueResult = await pool.query(`
      SELECT
        COALESCE(SUM(final_price), 0) AS total_revenue
      FROM registrations
      WHERE status IN (
        'confirmed',
        'medical_non_compliant'
      )
    `);


    const filePath = path.join(
      __dirname,
      "../../views/pages/dashboard.ejs"
    );


    ejs.renderFile(
      filePath,
      {
        title: "Dashboard",
        activities: activitiesResult.rows,
        totalRevenue:
          Number(revenueResult.rows[0].total_revenue),
      },
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

  } catch (err) {

    console.error(err);

    res.writeHead(500, {
      "Content-Type": "text/plain",
    });

    res.end("Database error");
  }
};


module.exports = {
  getDashboard,
};