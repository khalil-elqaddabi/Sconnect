const pool = require("../config/db");

// Check if the activity schedule conflicts
// with another activity in the same facility.
const checkScheduleCollision = (
  facilityId,
  dayOfWeek,
  startTime,
  endTime
) => {
  const sql = `
    SELECT id
    FROM activities
    WHERE facility_id = $1
      AND day_of_week = $2
      AND start_time < $4
      AND end_time > $3
    LIMIT 1
  `;

  return pool.query(sql, [
    facilityId,
    dayOfWeek,
    startTime,
    endTime,
  ]);
};

// Get the ERP capacity of a facility.
const checkERPCapacity = (facilityId) => {
  const sql = `
    SELECT erp_capacity
    FROM facilities
    WHERE id = $1
  `;

  return pool.query(sql, [facilityId]);
};

// Validate the complete schedule.
const validateSchedule = async (
  facilityId,
  dayOfWeek,
  startTime,
  endTime,
  activityCapacity
) => {
  // 1. Check ERP capacity
  const facilityResult = await checkERPCapacity(facilityId);

  if (facilityResult.rows.length === 0) {
    return {
      valid: false,
      message: "Facility not found",
    };
  }

  const erpCapacity = facilityResult.rows[0].erp_capacity;

  if (activityCapacity > erpCapacity) {
    return {
      valid: false,
      message: "Activity capacity exceeds facility ERP capacity",
    };
  }

  // 2. Check schedule collision
  const collisionResult = await checkScheduleCollision(
    facilityId,
    dayOfWeek,
    startTime,
    endTime
  );

  if (collisionResult.rows.length > 0) {
    return {
      valid: false,
      message: "Schedule collision detected",
    };
  }

  // 3. Everything is valid
  return {
    valid: true,
    message: "Schedule is valid",
  };
};

module.exports = {
  checkScheduleCollision,
  checkERPCapacity,
  validateSchedule,
};