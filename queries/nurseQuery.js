import client from "../db.js";

// 1. Get all active nurses with appointments
const getAllNursesQuery = async () => {
    const result = await client.query(`
      SELECT 
        n.*, 
        a.id AS appointment_id, a.date AS appointment_date, a.patient_id, -- or all appointment fields
        t.id AS test_id, t.name AS test_name, t.room_id,
        r.id AS room_id, r.name AS room_name
  
      FROM Nurses n
      LEFT JOIN Appointments a ON a.nurse_id = n.id
      LEFT JOIN Tests t ON t.nurse_id = n.id
      LEFT JOIN Rooms r ON t.room_id = r.id
  
      WHERE n.active = TRUE
    `);
    return result;
  };
  
const getNurseByIdQuery = async (id) => {
    const result = await client.query(`
      SELECT 
        n.*, 
        a.id AS appointment_id, a.date AS appointment_date, a.patient_id, -- or all appointment fields
        t.id AS test_id, t.name AS test_name, t.room_id,
        r.id AS room_id, r.name AS room_name
  
      FROM Nurses n
      LEFT JOIN Appointments a ON a.nurse_id = n.id
      LEFT JOIN Tests t ON t.nurse_id = n.id
      LEFT JOIN Rooms r ON t.room_id = r.id
  
      WHERE n.id = $1 AND n.active = TRUE
    `, [id]);
    return result;
  };
  
  

// 3. Create a nurse
const createNurseQuery = async (nurse) => {
  const {
    name, addr, phoneNumber, email, gender,
    shift, qualification
  } = nurse;

  const userName  = (()=> {
    const namePart = name.toLowerCase().split(' ');
    const emailPart = email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  const hashedPassword = await bcrypt.hash('password', 10);

  await client.query(`
    INSERT INTO Nurses
    (name, addr, "phoneNumber", email, gender, shift, qualification, password, "userName")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [name, addr, phoneNumber, email, gender, shift, qualification, hashedPassword, userName]);
};

// 4. Update a nurse
const updateNurseQuery = async (id, updateFields) => {
  const setStr = Object.keys(updateFields)
    .map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = [id, ...Object.values(updateFields)];
  const result = await client.query(`
    UPDATE Nurses SET ${setStr}
    WHERE id = $1
    RETURNING *
  `, values);
  return result;
};

// 5. Soft delete a nurse
const deleteNurseQuery = async (id) => {
  await client.query(`
    UPDATE Nurses SET active = FALSE WHERE id = $1
  `, [id]);
};

export {
    getAllNursesQuery,
    getNurseByIdQuery,
    createNurseQuery,
    updateNurseQuery,
    deleteNurseQuery
}
