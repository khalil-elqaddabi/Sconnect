const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");

const {
  calculateFinalPrice,
} = require("../services/pricingService");


const getCheckout = async (req, res) => {
  try {

    const membersResult = await pool.query(`
      SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.family_id,
        COALESCE(f.family_quotient, 0) AS family_quotient
      FROM members m
      LEFT JOIN families f ON m.family_id = f.id
      ORDER BY m.first_name, m.last_name
    `);

    const activitiesResult = await pool.query(`
      SELECT
        id,
        name,
        price
      FROM activities
      ORDER BY name
    `);

    const members = [];

    for (const member of membersResult.rows) {

      let familyRegistrationsCount = 1;

      if (member.family_id) {

        const result = await pool.query(`
          SELECT COUNT(*) AS total
          FROM registrations r
          JOIN members m ON r.member_id = m.id
          WHERE m.family_id = $1
            AND r.status IN ('confirmed', 'medical_non_compliant')
        `, [member.family_id]);

        familyRegistrationsCount =
          parseInt(result.rows[0].total, 10) + 1;
      }

      members.push({
        ...member,
        familyRegistrationsCount,
      });
    }

    const filePath = path.join(
      __dirname,
      "../../views/pages/checkout.ejs"
    );

    ejs.renderFile(
      filePath,
      {
        title: "Checkout",
        members,
        activities: activitiesResult.rows,
        member: null,
        activity: null,
        pricing: null,
        isResident: false,
        hasPassSport: false,
      },
      (err, html) => {

        if (err) {
          console.error(err);

          res.writeHead(500, {
            "Content-Type": "text/plain",
          });

          return res.end("Error rendering checkout page");
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


const calculateCheckout = async (req, res) => {

  try {

    const {
      member_id,
      activity_id,
      isResident,
      hasPassSport,
    } = req.body;


    // =========================
    // GET MEMBER
    // =========================

    const memberResult = await pool.query(`
      SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.family_id,
        f.family_quotient
      FROM members m
      LEFT JOIN families f ON m.family_id = f.id
      WHERE m.id = $1
    `, [member_id]);

    if (memberResult.rows.length === 0) {
      throw new Error("Member not found");
    }

    const member = memberResult.rows[0];


    // =========================
    // GET ACTIVITY
    // =========================

    const activityResult = await pool.query(`
      SELECT
        id,
        name,
        price
      FROM activities
      WHERE id = $1
    `, [activity_id]);

    if (activityResult.rows.length === 0) {
      throw new Error("Activity not found");
    }

    const activity = activityResult.rows[0];


    // =========================
    // FAMILY REGISTRATIONS
    // =========================

    let familyRegistrationsCount = 1;

    if (member.family_id) {

      const familyRegistrationsResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM registrations r
        JOIN members m
          ON r.member_id = m.id
        WHERE m.family_id = $1
          AND r.status IN ('confirmed', 'medical_non_compliant')
      `, [member.family_id]);

      const previousRegistrations =
        parseInt(
          familyRegistrationsResult.rows[0].total,
          10
        );

      familyRegistrationsCount =
        previousRegistrations + 1;
    }


    // =========================
    // FAMILY QUOTIENT
    // =========================

    const familyQuotient =
      Number(member.family_quotient || 0);


    // =========================
    // CALCULATE PRICE
    // =========================

    const pricing = calculateFinalPrice({

      basePrice: Number(activity.price),

      isResident:
        isResident === "true",

      familyRegistrationsCount,

      familyQuotient,

      hasPassSport:
        hasPassSport === "true",

    });


    // =========================
    // GET MEMBERS
    // =========================

    const membersResult = await pool.query(`
      SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.family_id,
        COALESCE(f.family_quotient, 0) AS family_quotient
      FROM members m
      LEFT JOIN families f
        ON m.family_id = f.id
      ORDER BY m.first_name, m.last_name
    `);


    const members = [];

    for (const memberItem of membersResult.rows) {

      let count = 1;

      if (memberItem.family_id) {

        const result = await pool.query(`
          SELECT COUNT(*) AS total
          FROM registrations r
          JOIN members m
            ON r.member_id = m.id
          WHERE m.family_id = $1
            AND r.status IN ('confirmed', 'medical_non_compliant')
        `, [memberItem.family_id]);

        count =
          parseInt(result.rows[0].total, 10) + 1;
      }

      members.push({
        ...memberItem,
        familyRegistrationsCount: count,
      });
    }


    // =========================
    // GET ACTIVITIES
    // =========================

    const activitiesResult = await pool.query(`
      SELECT
        id,
        name,
        price
      FROM activities
      ORDER BY name
    `);


    // =========================
    // RENDER
    // =========================

    const filePath = path.join(
      __dirname,
      "../../views/pages/checkout.ejs"
    );

    ejs.renderFile(
      filePath,
      {
        title: "Checkout",

        members,

        activities:
          activitiesResult.rows,

        member,

        activity,

        pricing,

        isResident:
          isResident === "true",

        hasPassSport:
          hasPassSport === "true",
      },
      (err, html) => {

        if (err) {
          console.error(err);

          res.writeHead(500, {
            "Content-Type": "text/plain",
          });

          return res.end(
            "Error rendering checkout page"
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

    res.writeHead(400, {
      "Content-Type": "text/plain",
    });

    res.end(err.message);
  }
};


module.exports = {
  getCheckout,
  calculateCheckout,
};