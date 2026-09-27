const pool = require("../config/db");
const ejs = require("ejs");
const path = require("path");

const {
  calculateFinalPrice,
} = require("../services/pricingService");

const {
  checkMemberEligibility,
} = require("../services/eligibilityService");

const {
  calculatePriorityScore,
} = require("../services/waitingListService");


// =====================================================
// CREATE REGISTRATION
// =====================================================

const createRegistration = async (req, res) => {

  const {
    member_id,
    activity_id,
    isResident,
    hasPassSport,
  } = req.body;

  const client = await pool.connect();

  try {

    await client.query("BEGIN");


    // =========================
    // GET ACTIVITY + LOCK
    // =========================

    const activityResult = await client.query(`
      SELECT
        id,
        max_capacity,
        price,
        age_min,
        age_max
      FROM activities
      WHERE id = $1
      FOR UPDATE
    `, [activity_id]);


    if (activityResult.rows.length === 0) {
      throw new Error("Activity not found");
    }


    const activity =
      activityResult.rows[0];


    // =========================
    // GET MEMBER
    // =========================

    const memberResult = await client.query(`
      SELECT
        m.id,
        m.birth_date,
        m.medical_certificate_valid_until,
        m.family_id,
        f.family_quotient
      FROM members m
      LEFT JOIN families f
        ON m.family_id = f.id
      WHERE m.id = $1
    `, [member_id]);


    if (memberResult.rows.length === 0) {
      throw new Error("Member not found");
    }


    const member =
      memberResult.rows[0];


    // =========================
    // ELIGIBILITY
    // =========================

    const eligibility =
      checkMemberEligibility(
        member,
        activity
      );


    if (!eligibility.eligible) {
      throw new Error(
        eligibility.message
      );
    }


    // =========================
    // FAMILY REGISTRATIONS
    // =========================

    let familyRegistrationsCount = 1;


    if (member.family_id) {

      const familyRegistrationsResult =
        await client.query(`
          SELECT COUNT(*) AS total
          FROM registrations r
          JOIN members m
            ON r.member_id = m.id
          WHERE m.family_id = $1
            AND r.status IN (
              'confirmed',
              'medical_non_compliant'
            )
        `, [member.family_id]);


      const previousRegistrations =
        parseInt(
          familyRegistrationsResult
            .rows[0]
            .total,
          10
        );


      familyRegistrationsCount =
        previousRegistrations + 1;
    }


    // =========================
    // FAMILY QUOTIENT
    // =========================

    const familyQuotient =
      Number(
        member.family_quotient || 0
      );


    // =========================
    // PRICING
    // =========================

    const pricing =
      calculateFinalPrice({

        basePrice:
          Number(activity.price),

        isResident:
          isResident === "true" ||
          isResident === true,

        familyRegistrationsCount,

        familyQuotient,

        hasPassSport:
          hasPassSport === "true" ||
          hasPassSport === true,

      });


    // =========================
    // CAPACITY
    // =========================

    const countResult =
      await client.query(`
        SELECT COUNT(*) AS total
        FROM registrations
        WHERE activity_id = $1
          AND status IN (
            'confirmed',
            'medical_non_compliant'
          )
      `, [activity_id]);


    const currentCount =
      parseInt(
        countResult.rows[0].total,
        10
      );


    // =========================
    // WAITING LIST
    // =========================

    if (
      currentCount >=
      activity.max_capacity
    ) {

      const resident =
        isResident === "true" ||
        isResident === true;


      const priorityScore =
        calculatePriorityScore(
          resident
        );


      await client.query(`
        INSERT INTO waiting_list (
          activity_id,
          member_id,
          position,
          priority_score,
          status
        )
        VALUES (
          $1,
          $2,
          (
            SELECT
              COALESCE(
                MAX(position),
                0
              ) + 1
            FROM waiting_list
            WHERE activity_id = $1
          ),
          $3,
          'waiting'
        )
      `, [
        activity_id,
        member_id,
        priorityScore,
      ]);


      await client.query(
        "COMMIT"
      );


      res.writeHead(201, {
        "Content-Type":
          "application/json",
      });


      res.end(
        JSON.stringify({

          message:
            "Activity is full. Member added to waiting list.",

          status:
            "waitlisted",

          priorityScore,

          finalPrice:
            pricing.finalPrice,

        })
      );


      return;
    }


    // =========================
    // REGISTRATION STATUS
    // =========================

    const registrationStatus =
      eligibility.medicalCompliant
        ? "confirmed"
        : "medical_non_compliant";


    // =========================
    // INSERT REGISTRATION
    // =========================

    const registrationResult =
      await client.query(`
        INSERT INTO registrations (
          member_id,
          activity_id,
          final_price,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING id
      `, [
        member_id,
        activity_id,
        pricing.finalPrice,
        registrationStatus,
      ]);


    await client.query(
      "COMMIT"
    );


    res.writeHead(201, {
      "Content-Type":
        "application/json",
    });


    res.end(
      JSON.stringify({

        message:
          "Registration created successfully",

        registrationId:
          registrationResult.rows[0].id,

        status:
          registrationStatus,

        age:
          eligibility.age,

        medicalCompliant:
          eligibility.medicalCompliant,

        finalPrice:
          pricing.finalPrice,

        paymentSchedule:
          pricing.paymentSchedule,

      })
    );

  } catch (err) {

    await client.query(
      "ROLLBACK"
    );

    console.error(err);


    res.writeHead(400, {
      "Content-Type":
        "text/plain",
    });


    res.end(
      err.message
    );

  } finally {

    client.release();

  }
};



// =====================================================
// GET REGISTRATIONS
// =====================================================

const getRegistrations = async (
  req,
  res
) => {

  try {

    const result =
      await pool.query(`
        SELECT
          r.id,
          r.final_price,
          r.status,
          m.first_name,
          m.last_name,
          a.name AS activity_name
        FROM registrations r
        JOIN members m
          ON r.member_id = m.id
        JOIN activities a
          ON r.activity_id = a.id
        ORDER BY r.id DESC
      `);


    const filePath =
      path.join(
        __dirname,
        "../../views/pages/registrations.ejs"
      );


    ejs.renderFile(
      filePath,
      {
        title:
          "Registrations",

        registrations:
          result.rows,
      },
      (err, html) => {

        if (err) {

          console.error(err);

          res.writeHead(500, {
            "Content-Type":
              "text/plain",
          });

          return res.end(
            "Error rendering registrations page"
          );
        }


        res.writeHead(200, {
          "Content-Type":
            "text/html",
        });


        res.end(html);

      }
    );

  } catch (err) {

    console.error(err);


    res.writeHead(500, {
      "Content-Type":
        "text/plain",
    });


    res.end(
      "Database error"
    );

  }
};



// =====================================================
// CANCEL REGISTRATION
// =====================================================

const cancelRegistration = async (
  req,
  res
) => {

  const {
    registration_id,
  } = req.body;


  const client =
    await pool.connect();


  try {

    await client.query(
      "BEGIN"
    );


    // =========================
    // GET REGISTRATION + LOCK
    // =========================

    const registrationResult =
      await client.query(`
        SELECT
          id,
          activity_id,
          status
        FROM registrations
        WHERE id = $1
        FOR UPDATE
      `, [registration_id]);


    if (
      registrationResult.rows.length === 0
    ) {

      throw new Error(
        "Registration not found"
      );

    }


    const registration =
      registrationResult.rows[0];


    // =========================
    // CHECK STATUS
    // =========================

    if (
      registration.status !==
        "confirmed" &&
      registration.status !==
        "medical_non_compliant"
    ) {

      throw new Error(
        "Registration cannot be cancelled"
      );

    }


    // =========================
    // CANCEL
    // =========================

    await client.query(`
      UPDATE registrations
      SET status = 'cancelled'
      WHERE id = $1
    `, [
      registration_id,
    ]);
    const waitingCandidateResult = await client.query(`
  SELECT id
  FROM waiting_list
  WHERE activity_id = $1
    AND status = 'waiting'
  ORDER BY
    priority_score DESC,
    position ASC,
    created_at ASC
  LIMIT 1
`, [registration.activity_id]);

if (waitingCandidateResult.rows.length > 0) {

  const deadline = new Date(
    Date.now() + 48 * 60 * 60 * 1000
  );

  await client.query(`
    UPDATE waiting_list
    SET
      status = 'promoted_pending',
      deadline_confirmation = $1
    WHERE id = $2
      AND status = 'waiting'
  `, [
    deadline,
    waitingCandidateResult.rows[0].id,
  ]);
}


    await client.query(
      "COMMIT"
    );


    res.writeHead(200, {
      "Content-Type":
        "application/json",
    });


    res.end(
      JSON.stringify({

        message:
          "Registration cancelled successfully",

        registrationId:
          registration.id,

        activityId:
          registration.activity_id,

      })
    );


  } catch (err) {

    await client.query(
      "ROLLBACK"
    );

    console.error(err);


    res.writeHead(400, {
      "Content-Type":
        "text/plain",
    });


    res.end(
      err.message
    );


  } finally {

    client.release();

  }
};



// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  createRegistration,

  getRegistrations,

  cancelRegistration,

};