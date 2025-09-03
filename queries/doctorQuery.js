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
        a.appointment_time AS appt_time,
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
        appointment_time: row.appt_time,
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
        a.appointment_time AS appt_time,
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
        appointment_time: row.appt_time,
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


const updateDoctorQuery = async (id, updates, room) => {
  updates["userName"] = (() => {
    const namePart = updates.name.toLowerCase().split(' ');
    const emailPart = updates.email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((field, i) => `"${field}" = $${i + 2}`).join(", ");

  if(room){
    await client.query(`DELETE FROM sits_at WHERE did = $1`, [id]);
    await client.query(`INSERT INTO sits_at (did, rid) VALUES ($1, $2)`, [id, room]);
  }
  
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

const getAppointmentsQuery = async (_id) => {
  const result = await client.query(`
      SELECT
      a._id AS appointment_id,
      a.appointment_time,
      a."dischargeTime",
      a.status,
      a.active,

      -- Patient Info
      p._id AS patient_id,
      p.name AS patient_name,
      p.addr AS patient_address,
      p.age AS patient_age,
      p."phoneNumber" AS patient_phone,
      p.email AS patient_email,
      p."userName" AS patient_username,
      p.gender AS patient_gender,
      p.gname AS patient_guardian_name,
      p."gPhoneNo" AS patient_guardian_phone,

      -- Doctor Info
      d._id AS doctor_id,
      d.name AS doctor_name,
      d.gender AS doctor_gender,
      d."phoneNumber" AS doctor_phone,
      d."inTime" AS doctor_in_time,
      d."outTime" AS doctor_out_time,
      d.spec AS doctor_specialization,
      trt.remarktime AS doctor_remark_time,
      trt.remarkmsg AS doctor_remark_msg,

      -- Doctor's Room
      r._id AS doctor_roomId,
      r.name AS doctor_roomName,

      -- Bed Info
      b._id AS bed_id,
      b.name AS bed_name,
      b."isOccupied" AS bed_occupied,
      
      -- Patient's Room
      r2._id AS patient_roomId,
      r2.name AS patient_roomName,

      -- Drug Info
      dr._id AS drug_id,
      dr.name AS drug_name,
      pr.dosage AS drug_dosage,

      -- Disease Info
      dis._id AS disease_id,
      dis.name AS disease_name,

      -- Test Info
      t._id AS test_id,
      t.name AS test_name,
      tr._id AS test_room_id,
      tr.name AS test_room_name,
      dt._id AS test_doctor_id,
      dt.name AS test_doctor_name,
      at.remarkmsg AS test_remark,

      -- Nurse Info
      n._id AS nurse_id,
      n.name AS nurse_name,
      n."phoneNumber" AS nurse_phone,
      n.shift AS nurse_shift,
      n.gender AS nurse_gender,
      la.remarktime AS nurse_remark_time,
      la.remarkmsg AS nurse_remark_msg,

      -- Hospital Professional Info
      hp._id AS hps_id,
      hp.name AS hps_name,
      hp."phoneNumber" AS hps_phone,
      hp.gender AS hps_gender

      FROM appointment a

      LEFT JOIN ptakes pt ON pt.aid = a._id
      LEFT JOIN patient p ON pt.pid = p._id

      LEFT JOIN treats trt ON trt.aid = a._id
      LEFT JOIN doctor d ON trt.did = d._id

      LEFT JOIN sits_at sa ON sa.did = d._id
      LEFT JOIN room r ON sa.rid = r._id

      LEFT JOIN stays_at sa2 ON sa2.aid = a._id
      LEFT JOIN bed b ON sa2.bid = b._id

      LEFT JOIN roomhasbed rhb ON rhb.bid = b._id
      LEFT JOIN room r2 on r2._id = rhb.rid

      LEFT JOIN prescription pr ON pr.aid = a._id
      LEFT JOIN drugs dr ON pr.dgid = dr._id

      LEFT JOIN apphasdis ad ON ad.aid = a._id
      LEFT JOIN disease dis ON ad.disid = dis._id

      LEFT JOIN apptakest at ON at.aid = a._id
      LEFT JOIN test t ON at.tid = t._id
      LEFT JOIN testroom trm ON trm.tid = t._id
      LEFT JOIN room tr ON trm.rid = tr._id
      LEFT JOIN doctortest dtj ON dtj.tid = t._id
      LEFT JOIN doctor dt ON dtj.did = dt._id

      LEFT JOIN looks_after la ON la.aid = a._id
      LEFT JOIN nurse n ON la.nid = n._id

      LEFT JOIN study s ON s.aid = a._id
      LEFT JOIN hospital_professional hp ON s.hid = hp._id

      WHERE trt.did = $1 AND a.active = TRUE AND a.status in ('Scheduled', 'Completed');
  `, [_id]);

  return result.rows;
};

export {
  getAllDoctorsQuery,
  getDoctorByIdQuery,
  createDoctorQuery,
  updateDoctorQuery,
  deleteDoctorQuery,
  getAppointmentsQuery
}
