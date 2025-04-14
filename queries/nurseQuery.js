import client from "../db.js";
import bcrypt from "bcrypt";

// 1. Get all active nurse with appointments
const getAllNursesQuery = async () => {
  const result = await client.query(`
    SELECT *   
    FROM nurse n  
    WHERE n.active = TRUE
  `);
  return result;
};

const getNurseByIdQuery = async (id) => {
  const result = await client.query(`
    SELECT 
      n.*, 
      a._id AS appointment_id, a.date AS appointment_date, a.patient, -- or all appointment fields
      t._id AS test_id, t.name AS test_name, t.room,
      r._id AS room_id, r.name AS room_name

    FROM nurse n
    LEFT JOIN appointment a ON a.nurse = n._id
    LEFT JOIN test t ON t.nurse_id = n._id
    LEFT JOIN room r ON t.room_id = r._id

    WHERE n._id = $1 AND n.active = TRUE
  `, [id]);
  return result;
};



// 3. Create a nurse
const createNurseQuery = async (nurse) => {
  const {
    name, addr, phoneNumber, email, gender,
    shift, qualification
  } = nurse;

  const userName = (() => {
    const namePart = name.toLowerCase().split(' ');
    const emailPart = email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  const hashedPassword = await bcrypt.hash('password', 10);

  await client.query(`
    INSERT INTO nurse
    (name, addr, "phoneNumber", email, gender, shift, qualification, password, "userName", role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Nurse')
  `, [name, addr, phoneNumber, email, gender, shift, qualification, hashedPassword, userName]);
};

// 4. Update a nurse
const updateNurseQuery = async (id, updateFields) => {
  const setStr = Object.keys(updateFields)
    .map((key, i) => `"${key}" = $${i + 2}`).join(', ');
  const values = [id, ...Object.values(updateFields)];
  const result = await client.query(`
    UPDATE nurse SET ${setStr}
    WHERE _id = $1
    RETURNING *
  `, values);
  return result;
};

// 5. Soft delete a nurse
const deleteNurseQuery = async (id) => {
  await client.query(`
    UPDATE nurse SET active = FALSE WHERE id = $1
  `, [id]);
};

export {
  getAllNursesQuery,
  getNurseByIdQuery,
  createNurseQuery,
  updateNurseQuery,
  deleteNurseQuery
}
