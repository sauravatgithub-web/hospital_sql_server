import  client  from  "../db.js"; // Assuming you are using a pg client

// SQL Query to get all active appointments
const getAllAppointmentsQuery = async () => {
    const result = await client.query('SELECT * FROM appointment WHERE active = TRUE;');
    return result.rows;
};

// SQL Query to get specific appointment by ID
const getAppointmentByIdQuery = async (id) => {
    const result = await client.query(`
        SELECT a._id AS appointment_id, 
               a.time, a.dischargeTime, a.status, a.active, 
               p._id AS patient_id, p.name AS patient_name, 
               d._id AS doctor_id, d.name AS doctor_name, 
               n._id AS nurse_id, n.name AS nurse_name, 
               hps._id AS hps_id, hps.name AS hps_name, 
               t._id AS test_id, t.name AS test_name, 
               r._id AS room_id, r.name AS room_name 
        FROM appointment a
        LEFT JOIN patient p ON a.patient = p._id
        LEFT JOIN doctor d ON a.doctor = d._id
        LEFT JOIN nurse n ON a.nurse = n._id
        LEFT JOIN hospital_professional hps ON a.hps = hps._id
        LEFT JOIN test t ON a.tests = t._id
        LEFT JOIN room r ON a.room = r._id
        WHERE a._id = $1 AND a.active = TRUE;
    `, [id]);

    return result.rows;
};

// SQL Query to create a new appointment
const createAppointmentQuery = async (time, dischargeTime, patient, doctor, room) => {
    const result = await client.query(`
        INSERT INTO appointment (time, dischargeTime, status, patient, doctor, room)
        VALUES ($1, $2, 'Scheduled', $3, $4, $5) RETURNING _id;
    `, [time, dischargeTime, patient, doctor, room]);

    return result.rows[0]._id; // Return the appointment ID
};

// SQL Query to update an appointment
const updateAppointmentQuery = async (time, dischargeTime, status, doctor, nurse, room, id) => {
    const result = await client.query(`
        UPDATE appointment SET 
            time = $1, dischargeTime = $2, status = $3, doctor = $4, nurse = $5, room = $6 
        WHERE _id = $7 RETURNING *;
    `, [time, dischargeTime, status, doctor, nurse, room, id]);

    return result.rows[0];
};

// SQL Query to delete an appointment (mark as inactive)
const deleteAppointmentQuery = async (id) => {
    const result = await client.query(`
        UPDATE appointment SET active = FALSE WHERE _id = $1 RETURNING *;
    `, [id]);

    return result.rows[0];
};

// SQL Query to get current appointments (InProgress)
const getCurrentAppointmentsQuery = async (entity, _id) => {
    const result = await client.query(`
        SELECT a._id AS appointment_id, 
               a.time, a.status, 
               p._id AS patient_id, p.name AS patient_name, 
               d._id AS doctor_id, d.name AS doctor_name, 
               n._id AS nurse_id, n.name AS nurse_name, 
               hps._id AS hps_id, hps.name AS hps_name, 
               r._id AS room_id, r.name AS room_name, 
               t._id AS test_id, t.name AS test_name 
        FROM appointment a
        LEFT JOIN patient p ON a.patient = p._id
        LEFT JOIN doctor d ON a.doctor = d._id
        LEFT JOIN nurse n ON a.nurse = n._id
        LEFT JOIN hospital_professional hps ON a.hps = hps._id
        LEFT JOIN test t ON a.tests = t._id
        LEFT JOIN room r ON a.room = r._id
        WHERE a.status = 'InProgress' AND a.${entity} = $1;
    `, [_id]);

    return result.rows;
};

export {
    getAllAppointmentsQuery,
    getAppointmentByIdQuery,
    createAppointmentQuery,
    updateAppointmentQuery,
    deleteAppointmentQuery,
    getCurrentAppointmentsQuery
}