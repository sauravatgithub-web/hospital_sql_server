import client from "../db.js";

// CREATE TEST
const createTestQuery = async (name, equip, room_id, doctor_id, nurse_id) => {
  try {
    await client.query('BEGIN');

    // Step 1: Insert the test
    const testResult = await client.query(`
        INSERT INTO Test (name, equip, active)
        VALUES ($1, $2, TRUE)
        RETURNING *;
      `, [name, equip]);

    const test = testResult.rows[0];
    const testId = test._id;

    // Step 2: Create relationships
    await client.query(`INSERT INTO DoctorTest (did, tid) VALUES ($1, $2)`, [doctor_id, testId]);
    await client.query(`INSERT INTO NurseTest (nid, tid) VALUES ($1, $2)`, [nurse_id, testId]);
    await client.query(`INSERT INTO TestRoom (rid, tid) VALUES ($1, $2)`, [room_id, testId]);

    // Step 3: Decrement vacancy from Room
    const roomUpdate = await client.query(`
        UPDATE Room SET vacancy = vacancy - 1 WHERE _id = $1 AND vacancy > 0 RETURNING *;
      `, [room_id]);

    if (roomUpdate.rows.length === 0) throw new Error("Room is full or doesn't exist");

    await client.query('COMMIT');
    return { test, room: roomUpdate.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
};


// GET ALL TESTS
const getAllTestQuery = async () => {
  return await client.query(`
    SELECT 
      t._id AS test_id,
      t.name AS test_name,
      t.equip,
      t.active,

      -- Doctor details
      d._id AS doctor_id,
      d.name AS doctor_name,
      d.email AS doctor_email,

      -- Nurse details
      n._id AS nurse_id,
      n.name AS nurse_name,
      n.email AS nurse_email,

      -- Room details
      r._id AS room_id,
      r.name AS room_name,
      r.type AS room_type

    FROM Test t
    LEFT JOIN DoctorTest dt ON t._id = dt.tid
    LEFT JOIN Doctor d ON dt.did = d._id

    LEFT JOIN NurseTest nt ON t._id = nt.tid
    LEFT JOIN Nurse n ON nt.nid = n._id

    LEFT JOIN TestRoom tr ON t._id = tr.tid
    LEFT JOIN Room r ON tr.rid = r._id

    WHERE t.active = TRUE;
  `);
};


// GET TEST BY ID
const getTestByIdQuery = async (id) => {
  return await client.query(`
      SELECT 
        t._id AS test_id,
        t.name AS test_name,
        t.equip AS test_equip,
        t.active AS test_active,
        r._id AS room_id,
        r.name AS room_name,
        d._id AS doctor_id,
        d.name AS doctor_name,
        n._id AS nurse_id,
        n.name AS nurse_name
      FROM Test t
      LEFT JOIN testroom tr ON tr.tid = t._id
      LEFT JOIN Room r ON tr.rid = r._id
      LEFT JOIN doctortest dt ON dt.tid = t._id
      LEFT JOIN Doctor d ON dt.did = d._id
      LEFT JOIN nursetest nt ON nt.tid = t._id
      LEFT JOIN Nurse n ON nt.nid = n._id
      WHERE t._id = $1 AND t.active = TRUE;
    `, [id]);
};


// UPDATE TEST
const updateTestQuery = async ( id, name , equip, doctor, nurse, room) => {
  try {
    await client.query('BEGIN');

    // Update main test table
    await client.query(`
      UPDATE test
      SET name = $1, equip = $2
      WHERE _id = $3;
    `, [name, equip, id]);

    // Upsert into doctortest
    if (doctor !== undefined) {
      await client.query(`DELETE FROM doctortest WHERE tid = $1;`, [id]);
      await client.query(`INSERT INTO doctortest (did, tid) VALUES ($1, $2);`, [doctor, id]);
    }

    // Upsert into nursetest
    if (nurse !== undefined) {
      await client.query(`DELETE FROM nursetest WHERE tid = $1;`, [id]);
      await client.query(`INSERT INTO nursetest (nid, tid) VALUES ($1, $2);`, [nurse, id]);
    }

    // Upsert into testroom
    if (room !== undefined) {
      await client.query(`DELETE FROM testroom WHERE tid = $1;`, [id]);
      await client.query(`INSERT INTO testroom (rid, tid) VALUES ($1, $2);`, [room, id]);
    }

    // const testResult = await client.query(`SELECT * FROM test WHERE _id = $1;`, [id]);
    // await client.query('COMMIT');
    // return testResult.rows[0];
    return await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  };
}

// DELETE (SOFT) TEST
const deleteTestQuery = async (id) => {
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM doctortest WHERE tid = $1;`, [id]);
    await client.query(`DELETE FROM nursetest WHERE tid = $1;`, [id]);
    await client.query(`UPDATE Test SET active = FALSE WHERE _id = $1`, [id]);
    return await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  };
};

// UPDATE ROOM VACANCY
const decrementRoomVacancy = async (room_id) => {
  return await client.query(`
    UPDATE Room SET vacancy = vacancy - 1 WHERE _id = $1 AND vacancy > 0 RETURNING *;
  `, [room_id]);
};

// APPEND TEST TO RELATED TABLES (if needed, create relationships here)
export {
  createTestQuery,
  getAllTestQuery,
  getTestByIdQuery,
  updateTestQuery,
  deleteTestQuery,
  decrementRoomVacancy
}