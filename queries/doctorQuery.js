import client from "../db.js";
import bcrypt from "bcrypt";

const getAllDoctorsQuery = async () => {
  const result = await client.query(`
      SELECT 
        d._id AS doctor_id,
        d.name AS doctor_name,
        d.addr,
        d.spec,
        d."inTime",
        d."outTime",
        d."phoneNumber",
        d.email,
        d."userName",
        d.gender,
        d.role,
        d.qualification,
        d."DOJ",
        d.active,
        r._id AS room_id,
        r.name AS room_name,
        h._id AS hps_id,
        h.name AS hps_name,
        a._id AS appt_id,
        a.time AS appt_time,
        a.status AS appt_status,
        t._id AS test_id,
        t.name AS test_name,
        r2._id AS test_room_id,
        r2.name AS test_room_name
      FROM doctor d
      LEFT JOIN sits_at sit ON sit.did = d._id
      LEFT JOIN room r ON sit.rid = r._id
      LEFT JOIN supervises dh ON d._id = dh.did
      LEFT JOIN hospital_professional h ON dh.hid = h._id
      LEFT JOIN treats tr ON d._id = tr.did
      LEFT JOIN doctortest dt ON d._id = dt.did
      LEFT JOIN test t ON dt.tid = t._id
      LEFT JOIN apptakest at ON at.tid = t._id
      LEFT JOIN appointment a ON at.aid = a._id
      LEFT JOIN testroom troom ON troom.tid = t._id
      LEFT JOIN room r2 ON troom.rid = r2._id
      WHERE d.active = TRUE;
    `);

  const doctorMap = new Map();

  result.rows.forEach(row => {
    const doctorId = row.doctor_id;
    if (!doctorMap.has(doctorId)) {
      doctorMap.set(doctorId, {
        _id: doctorId,
        name: row.doctor_name,
        addr: row.addr,
        spec: row.spec,
        inTime: row.inTime,
        outTime: row.outTime,
        phoneNumber: row.phoneNumber,
        email: row.email,
        userName: row.username,
        gender: row.gender,
        role: row.role,
        qualification: row.qualification,
        DOJ: row.doj,
        active: row.active,
        room: row.room_id ? { _id: row.room_id, name: row.room_name } : null,
        hps: [],
        appointments: [],
        tests: []
      });
    }

    const doctor = doctorMap.get(doctorId);

    if (row.hps_id && !doctor.hps.some(h => h._id === row.hps_id)) {
      doctor.hps.push({ _id: row.hps_id, name: row.hps_name });
    }

    if (row.appt_id && !doctor.appointments.some(a => a._id === row.appt_id)) {
      doctor.appointments.push({
        _id: row.appt_id,
        time: row.appt_time,
        status: row.appt_status
      });
    }

    if (row.test_id && !doctor.tests.some(t => t._id === row.test_id)) {
      doctor.tests.push({
        _id: row.test_id,
        name: row.test_name,
        room: row.test_room_id ? { _id: row.test_room_id, name: row.test_room_name } : null
      });
    }
  });

  const populatedDoctors = Array.from(doctorMap.values());
  return populatedDoctors;
};

const getDoctorByIdQuery = async (id) => {
  const result = await client.query(`
      SELECT 
        d._id AS doctor_id,
        d.name AS doctor_name,
        d.addr,
        d.spec,
        d."inTime",
        d."outTime",
        d."phoneNumber",
        d.email,
        d."userName",
        d.gender,
        d.role,
        d.qualification,
        d."DOJ",
        d.active,
        -- Room data (via sits_at)
        r._id AS room_id,
        r.name AS room_name,
        -- Hospital Professionals (HPS)
        h._id AS hps_id,
        h.name AS hps_name,
        -- Appointments
        a._id AS appt_id,
        a.time AS appt_time,
        a.status AS appt_status,
        -- Tests and associated Room for test
        t._id AS test_id,
        t.name AS test_name,
        r2._id AS test_room_id,
        r2.name AS test_room_name
      FROM doctor d
      LEFT JOIN sits_at sit ON sit.did = d._id
      LEFT JOIN room r ON sit.rid = r._id
      LEFT JOIN supervises dh ON d._id = dh.did
      LEFT JOIN hospital_professional h ON dh.hid = h._id
      LEFT JOIN treats tr ON d._id = tr.did
      LEFT JOIN appointment a ON tr.aid = a._id
      LEFT JOIN doctortests dt ON d._id = dt.did
      LEFT JOIN test t ON dt.tid = t._id
      LEFT JOIN testroom troom ON troom.tid = t._id
      LEFT JOIN room r2 ON troom.rid = r2._id
      WHERE d.active = TRUE AND d._id = $1;`, [id]
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  // Use a map to consolidate rows for the single doctor.
  const doctorMap = new Map();

  result.rows.forEach(row => {
    const doctorId = row.doctor_id;
    if (!doctorMap.has(doctorId)) {
      doctorMap.set(doctorId, {
        _id: doctorId,
        name: row.doctor_name,
        addr: row.addr,
        spec: row.spec,
        inTime: row.inTime,
        outTime: row.outTime,
        phoneNumber: row.phoneNumber,
        email: row.email,
        userName: row.useName,
        gender: row.gender,
        role: row.role,
        qualification: row.qualification,
        DOJ: row.doj,
        active: row.active,
        room: row.room_id ? { _id: row.room_id, name: row.room_name } : null,
        hps: [],
        appointments: [],
        tests: []
      });
    }

    const doctor = doctorMap.get(doctorId);

    // Add Hospital Professionals if not already added.
    if (row.hps_id && !doctor.hps.some(h => h._id === row.hps_id)) {
      doctor.hps.push({ _id: row.hps_id, name: row.hps_name });
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
        room: row.test_room_id ? { _id: row.test_room_id, name: row.test_room_name } : null
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

  const userName  = (()=> {
    const namePart = name.toLowerCase().split(' ');
    const emailPart = email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  const hashedPassword = await bcrypt.hash('password', 10);

  // Step 1: Insert doctor
  const result = await client.query(`
    INSERT INTO doctor (name, addr, spec, "inTime", "outTime", "phoneNumber", email, gender, qualification, password, "userName", role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Doctor')
    RETURNING *;
  `, [name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, hashedPassword, userName]);

  const insertedDoctor = result.rows[0];

  // Step 2: Insert into sits_at table to associate room
  await client.query(`
    INSERT INTO sits_at (did, rid)
    VALUES ($1, $2);
  `, [insertedDoctor._id, room]);

  return insertedDoctor;
};


const updateDoctorQuery = async (id, updates) => {
  updates["userName"] = (() => {
    const namePart = updates.name.toLowerCase().split(' ');
    const emailPart = updates.email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((field, i) => `"${field}" = $${i + 2}`).join(", ");
  return await client.query(`
      UPDATE doctor
      SET ${setClause}
      WHERE _id = $1
      RETURNING *;
    `, [id, ...values]);
};

const deleteDoctorQuery = async (id) => {
  return await client.query(`
      UPDATE doctor
      SET active = FALSE
      WHERE _id = $1;
    `, [id]);
};

const getDocAppointment = async (id) => {
  return await client.query(
    `SELECT 
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
  FROM appointment a
  LEFT JOIN patient p ON a.patient_id = p._id
  LEFT JOIN appointment_disease ad ON a._id = ad.appointment_id
  LEFT JOIN disease dis ON ad.disease_id = dis._id
  INNER JOIN treats t ON t.aid = a._id
  WHERE t.did = $1
    AND a.status IN ('Scheduled', 'Completed');`
    , [id]);
}

export {
  getAllDoctorsQuery,
  getDoctorByIdQuery,
  createDoctorQuery,
  updateDoctorQuery,
  deleteDoctorQuery,
  getDocAppointment
}
