import  client  from  "../db.js";

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
  

const deletePatientQuery = async (id) => {
    return await client.query(
        'UPDATE Patient SET active = FALSE WHERE _id = $1;',
        [id]
    );
};

export {getAllPatientQuery, 
        getThisPatientQuery, 
        getPatientByNumberQuery, 
        deletePatientQuery, 
        getPatientByEmailQueryWithAppointments,
        getPatientByIdQueryWithAppointments,
        updatePatientQuery
    }
