import client from "../db.js";

const getAllPatientQuery = async () => {
  return await client.query('SELECT * FROM Patient WHERE active = TRUE ;');
};

const getThisPatientQuery = async (id) => {
  return await client.query(`SELECT * FROM Patient WHERE active = TRUE and _id = $1 ;`, [id]);
};

const getPatientByNumberQuery = async (phoneNumber) => {
  return await client.query(`
      SELECT 
        p.*, 
        a._id AS appointment_id, 
        a.time, 
        a."dischargeTime", 
        a.status
      FROM Patient p
      LEFT JOIN pTakes pt ON pt.pid = p._id
      LEFT JOIN Appointment a ON a._id = pt.aid
      WHERE p.active = TRUE AND p."phoneNumber" = $1;
    `, [phoneNumber]);
};

const getPatientByEmailQueryWithAppointments = async (email) => {
  return await client.query(`
      SELECT 
        p.*, 
        a._id AS appointment_id, 
        a.time, 
        a."dischargeTime", 
        a.status
      FROM Patient p
      LEFT JOIN pTakes pt ON pt.pid = p._id
      LEFT JOIN Appointment a ON a._id = pt.aid
      WHERE p.active = TRUE AND p.email = $1;
    `, [email]);
};

const getPatientByIdQueryWithAppointments = async (id) => {
  return await client.query(`
      SELECT 
        p.*, 
        a._id AS appointment_id, 
        a.time, 
        a."dischargeTime", 
        a.status
      FROM Patient p
      LEFT JOIN pTakes pt ON pt.pid = p._id
      LEFT JOIN Appointment a ON a._id = pt.aid
      WHERE p.active = TRUE AND p._id = $1;
    `, [id]);
};

const updatePatientQuery = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return false;

  const updates = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = [...Object.values(fields), id];

  const result = await db.query(`
      UPDATE Patient SET ${updates} WHERE _id = $${keys.length + 1}
    `, values);

  return result.rowCount > 0;
};

const createPatientQuery = async ({
  name,
  gender,
  age,
  phoneNumber,
  gname,
  gPhoneNo,
  addr,
  email,
  userName
}) => {
  const query = `
    INSERT INTO Patient (
      name, gender, age, "phoneNumber", gname, "gPhoneNo",
      addr, email, "userName", active
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, TRUE
    )
    RETURNING *;
  `;
  const values = [
    name,
    gender,
    age,
    phoneNumber,
    gname,
    gPhoneNo,
    addr,
    email,
    userName
  ];

  return await client.query(query, values);
};



const deletePatientQuery = async (id) => {
  return await client.query(
    'UPDATE Patient SET active = FALSE WHERE _id = $1;',
    [id]
  );
};

export {
  getAllPatientQuery,
  getThisPatientQuery,
  getPatientByNumberQuery,
  createPatientQuery,
  deletePatientQuery,
  getPatientByEmailQueryWithAppointments,
  getPatientByIdQueryWithAppointments,
  updatePatientQuery
}
