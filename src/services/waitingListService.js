const pool = require("../config/db");


// =====================================================
// PRIORITY
// =====================================================

const calculatePriorityScore = (isResident) => {
  return isResident ? 10 : 0;
};


// =====================================================
// GET NEXT WAITING CANDIDATE
// =====================================================

const getNextWaitingCandidate = async (activityId) => {

  const result = await pool.query(`
    SELECT
      id,
      member_id,
      activity_id,
      position,
      priority_score,
      created_at,
      status
    FROM waiting_list
    WHERE activity_id = $1
      AND status = 'waiting'
    ORDER BY
      priority_score DESC,
      position ASC,
      created_at ASC
    LIMIT 1
  `, [activityId]);

  return result.rows[0] || null;
};


// =====================================================
// PROMOTE NEXT CANDIDATE
// =====================================================

const promoteNextCandidate = async (activityId) => {

  const candidate =
    await getNextWaitingCandidate(activityId);

  if (!candidate) {
    return null;
  }


  const deadline =
    new Date(
      Date.now() + 48 * 60 * 60 * 1000
    );


  const result = await pool.query(`
    UPDATE waiting_list
    SET
      status = 'promoted_pending',
      deadline_confirmation = $1
    WHERE id = $2
      AND status = 'waiting'
    RETURNING *
  `, [
    deadline,
    candidate.id,
  ]);


  return result.rows[0] || null;
};


// =====================================================
// EXPIRE PROMOTED CANDIDATES
// =====================================================

const expirePromotedCandidates = async () => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const expiredResult = await client.query(`
      UPDATE waiting_list
      SET status = 'cancelled'
      WHERE status = 'promoted_pending'
        AND deadline_confirmation < CURRENT_TIMESTAMP
      RETURNING activity_id
    `);

    for (const expired of expiredResult.rows) {

      const nextCandidate = await client.query(`
        SELECT id
        FROM waiting_list
        WHERE activity_id = $1
          AND status = 'waiting'
        ORDER BY
          priority_score DESC,
          position ASC,
          created_at ASC
        LIMIT 1
      `, [expired.activity_id]);

      if (nextCandidate.rows.length === 0) {
        continue;
      }

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
        nextCandidate.rows[0].id,
      ]);
    }

    await client.query("COMMIT");

    return expiredResult.rows;

  } catch (err) {

    await client.query("ROLLBACK");

    throw err;

  } finally {

    client.release();

  }
};


// =====================================================
// GET PROMOTED CANDIDATE
// =====================================================

const getPromotedCandidate = async (
  waitingListId
) => {

  const result = await pool.query(`
    SELECT *
    FROM waiting_list
    WHERE id = $1
      AND status = 'promoted_pending'
  `, [waitingListId]);

  return result.rows[0] || null;
};


module.exports = {

  calculatePriorityScore,

  getNextWaitingCandidate,

  promoteNextCandidate,

  expirePromotedCandidates,

  getPromotedCandidate,

};