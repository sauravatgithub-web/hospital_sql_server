import client from "../db.js";

const getAllDoctorsQuery = async (req, res, next) => {
  const result = await client.query(`
      SELECT 
        d._id AS doctor_id,
        d.name AS doctor_name,
        d.addr,
        d.spec,
        d.intime,
        d.outtime,
        d.phonenumber,
        d.email,
        d.username,
        d.gender,
        d.role,
        d.qualification,
        d.doj,
        d.active,
        -- Room data
        r._id AS room_id,
        r.name AS room_name,
        -- Hospital Professionals (HPS)
        h._id AS hps_id,
        h.name AS hps_name,
        -- Appointments
        a._id AS appt_id,
        a.time AS appt_time,
        a.status AS appt_status,
        -- Tests data and associated Room for test
        t._id AS test_id,
        t.name AS test_name,
        r2._id AS test_room_id,
        r2.name AS test_room_name
      FROM "Doctor" d
      LEFT JOIN Room r ON d.room_id = r._id
      LEFT JOIN Doctor_HPS dh ON d._id = dh.doctor_id
      LEFT JOIN Hospital_Professional h ON dh.hps_id = h._id
      LEFT JOIN Doctor_Appointments da ON d._id = da.doctor_id
      LEFT JOIN Appointment a ON da.appointment_id = a._id
      LEFT JOIN Doctor_Tests dt ON d._id = dt.doctor_id
      LEFT JOIN Test t ON dt.test_id = t._id
      LEFT JOIN Room r2 ON t.room_id = r2._id
      WHERE d.active = TRUE;
    `);

  // Use a map to group doctor rows.
  const doctorMap = new Map();

  result.rows.forEach(row => {
    const doctorId = row.doctor_id;
    if (!doctorMap.has(doctorId)) {
      // Build the base doctor object with room info.
      doctorMap.set(doctorId, {
        _id: doctorId,
        name: row.doctor_name,
        addr: row.addr,
        spec: row.spec,
        inTime: row.intime,
        outTime: row.outtime,
        phoneNumber: row.phonenumber,
        email: row.email,
        userName: row.username,
        gender: row.gender,
        role: row.role,
        qualification: row.qualification,
        DOJ: row.doj,
        active: row.active,
        room: row.room_id ? {
          _id: row.room_id,
          name: row.room_name
        } : null,
        hps: [],
        appointments: [],
        tests: []
      });
    }
    const doctor = doctorMap.get(doctorId);

    // Add hospital professionals if not already added.
    if (row.hps_id && !doctor.hps.some(h => h._id === row.hps_id)) {
      doctor.hps.push({
        _id: row.hps_id,
        name: row.hps_name
      });
    }
    // Add appointments if not already added.
    if (row.appt_id && !doctor.appointments.some(a => a._id === row.appt_id)) {
      doctor.appointments.push({
        _id: row.appt_id,
        time: row.appt_time,
        status: row.appt_status
      });
    }
    // Add tests if not already added.
    if (row.test_id && !doctor.tests.some(t => t._id === row.test_id)) {
      doctor.tests.push({
        _id: row.test_id,
        name: row.test_name,
        room: row.test_room_id ? {
          _id: row.test_room_id,
          name: row.test_room_name
        } : null
      });
    }
  });

  const populatedDoctors = Array.from(doctorMap.values());
  return populatedDoctors;
};



const getDoctorByIdQuery = async (req, res, next) => {
  const id = req.params.id;

  const result = await client.query(
    `
      SELECT 
        d._id AS doctor_id,
        d.name AS doctor_name,
        d.addr,
        d.spec,
        d.intime,
        d.outtime,
        d.phonenumber,
        d.email,
        d.username,
        d.gender,
        d.role,
        d.qualification,
        d.doj,
        d.active,
        -- Room information
        r._id AS room_id,
        r.name AS room_name,
        -- Hospital Professionals (HPS)
        h._id AS hps_id,
        h.name AS hps_name,
        -- Appointments
        a._id AS appt_id,
        a.time AS appt_time,
        a.status AS appt_status,
        -- Tests and associated room for test
        t._id AS test_id,
        t.name AS test_name,
        r2._id AS test_room_id,
        r2.name AS test_room_name
      FROM "Doctor" d
      LEFT JOIN Room r ON d.room_id = r._id
      LEFT JOIN Doctor_HPS dh ON d._id = dh.doctor_id
      LEFT JOIN Hospital_Professional h ON dh.hps_id = h._id
      LEFT JOIN Doctor_Appointments da ON d._id = da.doctor_id
      LEFT JOIN Appointment a ON da.appointment_id = a._id
      LEFT JOIN Doctor_Tests dt ON d._id = dt.doctor_id
      LEFT JOIN Test t ON dt.test_id = t._id
      LEFT JOIN Room r2 ON t.room_id = r2._id
      WHERE d.active = TRUE AND d._id = $1;
      `,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  // Use a map to consolidate rows for the single doctor.
  const doctorMap = new Map();

  result.rows.forEach(row => {
    const doctorId = row.doctor_id;
    if (!doctorMap.has(doctorId)) {
      // Build the base doctor object including room info.
      doctorMap.set(doctorId, {
        _id: doctorId,
        name: row.doctor_name,
        addr: row.addr,
        spec: row.spec,
        inTime: row.intime,
        outTime: row.outtime,
        phoneNumber: row.phonenumber,
        email: row.email,
        userName: row.username,
        gender: row.gender,
        role: row.role,
        qualification: row.qualification,
        DOJ: row.doj,
        active: row.active,
        room: row.room_id ? {
          _id: row.room_id,
          name: row.room_name
        } : null,
        hps: [],
        appointments: [],
        tests: []
      });
    }

    const doctor = doctorMap.get(doctorId);

    // Add Hospital Professionals if not already added.
    if (row.hps_id && !doctor.hps.some(h => h._id === row.hps_id)) {
      doctor.hps.push({
        _id: row.hps_id,
        name: row.hps_name
      });
    }

    // Add Appointments if not already added.
    if (row.appt_id && !doctor.appointments.some(a => a._id === row.appt_id)) {
      doctor.appointments.push({
        _id: row.appt_id,
        time: row.appt_time,
        status: row.appt_status
      });
    }

    // Add Tests if not already added.
    if (row.test_id && !doctor.tests.some(t => t._id === row.test_id)) {
      doctor.tests.push({
        _id: row.test_id,
        name: row.test_name,
        room: row.test_room_id ? {
          _id: row.test_room_id,
          name: row.test_room_name
        } : null
      });
    }
  });

  // Since we're fetching a single doctor, get the first (and only) entry from the map.
  const populatedDoctor = Array.from(doctorMap.values())[0];
  return populatedDoctor;
};



const createDoctorQuery = async (doctor) => {
  const {
    name, addr, spec, inTime, outTime,
    phoneNumber, email, gender, qualification,
    room, password
  } = doctor;

  return await client.query(`
      INSERT INTO "Doctor" (name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `, [name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room, password]);
};

const updateDoctorQuery = async (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(", ");
  return await client.query(`
      UPDATE "Doctor"
      SET ${setClause}
      WHERE _id = $1
      RETURNING *;
    `, [id, ...values]);
};

const deleteDoctorQuery = async (id) => {
  return await client.query(`
      UPDATE "Doctor"
      SET active = FALSE
      WHERE _id = $1;
    `, [id]);
};

const getDocAppointment = async (id) => {
  return await client.query(
    `
        SELECT 
          a._id AS appt_id,
          a.time AS appt_time,
          a.dischargetime AS discharge_time,
          a.status AS appt_status,
          -- Patient fields
          p._id AS patient_id,
          p.name AS patient_name,
          p.gender AS patient_gender,
          p.age AS patient_age,
          p.phonenumber AS patient_phonenumber,
          p.gname AS patient_gname,
          p.gphoneno AS patient_gphoneno,
          p.addr AS patient_addr,
          p.email AS patient_email,
          p.username AS patient_username,
          -- Disease fields from the junction table
          dis._id AS disease_id,
          dis.name AS disease_name
        FROM "Appointment" a
        LEFT JOIN Patient p ON a.patient_id = p._id
        LEFT JOIN Appointment_Disease ad ON a._id = ad.appointment_id
        LEFT JOIN Disease dis ON ad.disease_id = dis._id
        WHERE a.doctor_id = $1
          AND a.status IN ('Scheduled', 'Completed')
        `,
    [id]
  );
}

export {
  getAllDoctorsQuery,
  getDoctorByIdQuery,
  createDoctorQuery,
  updateDoctorQuery,
  deleteDoctorQuery,
  getDocAppointment
}
