import {
  createTestQuery,
  getAllTestQuery,
  getTestByIdQuery,
  updateTestQuery,
  deleteTestQuery
} from "../queries/testQuery.js";

import { tryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";

const getAllTest = tryCatch(async (req, res) => {
  const result = await getAllTestQuery();

  const testsMap = new Map();

  for (const row of result.rows) {
    const testId = row.test_id;

    if (!testsMap.has(testId)) {
      testsMap.set(testId, {
        _id: testId,
        name: row.test_name,
        equip: row.equip,
        active: row.active,
        doctor: row.doctor_id
          ? {
              _id: row.doctor_id,
              name: row.doctor_name,
              email: row.doctor_email
            }
          : null,
        nurse: row.nurse_id
          ? {
              _id: row.nurse_id,
              name: row.nurse_name,
              email: row.nurse_email
            }
          : null,
        room: row.room_id
          ? {
              _id: row.room_id,
              name: row.room_name,
              type: row.room_type
            }
          : null
      });
    }
  }

  const allTests = Array.from(testsMap.values());

  return res.status(200).json({ success: true, data: allTests });
});

const getThisTestById = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  // Execute query to fetch test by ID
  const result = await getThisTestByIdQuery(id);
  
  if (!result.rows.length) {
    return next(new ErrorHandler("Test not found", 404));
  }

  // Format the response according to the desired model
  const testData = result.rows[0];
  const test = {
    test_id: testData.test_id,
    test_name: testData.test_name,
    test_equip: testData.test_equip,
    test_active: testData.test_active,
    room: {
      room_id: testData.room_id,
      room_name: testData.room_name,
    },
    doctor: {
      doctor_id: testData.doctor_id,
      doctor_name: testData.doctor_name,
    },
    nurse: {
      nurse_id: testData.nurse_id,
      nurse_name: testData.nurse_name,
    },
  };

  return res.status(200).json({ success: true, test });
});

const createTest = tryCatch(async (req, res, next) => {
  const { name, equip, room, doctor, nurse } = req.body;
  if (!name || !equip || !room || !doctor || !nurse) {
    return next(new ErrorHandler("Insufficient input", 400));
  }

  const result = await createTestQuery(name, equip, room, doctor, nurse);
  return res.status(200).json({ success: true, message: "Test created", test: result.rows[0] });
});

const updateTest = tryCatch(async (req, res, next) => {
  const { id, ...fields } = req.body;
  const result = await updateTestQuery(id, fields);
  if (result.rows.length === 0) return next(new ErrorHandler("Test not found", 404));
  return res.status(200).json({ success: true, message: "Test updated", test: result.rows[0] });
});

const deleteTest = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteTestQuery(id);
  if (result.rowCount === 0) return next(new ErrorHandler("Test not found", 404));
  return res.status(200).json({ success: true, message: "Test deleted successfully" });
});

export { 
  getAllTest, 
  getThisTest, 
  createTest, 
  updateTest, 
  deleteTest 
};
