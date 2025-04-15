import client from "../db.js";

const getAllHospitalStaffQuery = async () => {
  return await client.query('SELECT * FROM Hospital_Staff WHERE active = TRUE ;');
};

const getThisHospitalStaffQuery = async (name) => {
  return await client.query(`SELECT * FROM Hospital_Staff WHERE active = TRUE and name = $1 ;`, [name]);
};

const createHospitalStaffQuery = async (staff) => {
  const {
    name, addr, phoneNumber, email, gender,
    department, designation, shift, role, password
  } = staff;

  const userName = (() => {
    const namePart = name.toLowerCase().split(' ');
    const emailPart = email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  return await client.query(`
      INSERT INTO Hospital_Staff (
        name, addr, "phoneNumber", email, gender,
        department, designation, shift, role, password, active, "userName"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, TRUE, $11
      ) RETURNING *;
    `, [name, addr, phoneNumber, email, gender, department, designation, shift, role, password, userName]);
};


const updateHospitalStaffQuery = async (id, updates) => {
  const {
    name, addr, phoneNumber, email, gender,
    department, designation, shift, role
  } = updates;

  return await client.query(`
      UPDATE Hospital_Staff SET
        name = $1,
        addr = $2,
        "phoneNumber" = $3,
        email = $4,
        gender = $5,
        department = $6,
        designation = $7,
        shift = $8,
        role = $9
      WHERE _id = $10
      RETURNING *;
    `, [name, addr, phoneNumber, email, gender, department, designation, shift, role, id]);
};


const deleteHospitalStaffQuery = async (id) => {
  return await client.query(
    'UPDATE Hospital_Staff SET active = FALSE WHERE _id = $1;',
    [id]
  );
};

const getAllCurrentDoctorsQuery = async () => {
  const now = new Date();
  const time = now.toISOString().slice(11, 16); // e.g., "14:32"

  const query = `
    SELECT 
      d._id AS doctor_id, d.name AS doctor_name, d.addr, d.email, d.gender,
      d.role, d.spec, d.qualification, d."userName", d."phoneNumber",
      d."DOJ", d."inTime", d."outTime",
      r._id AS room_id, r.name AS room_name,
      a._id AS appointment_id, a."time", a."dischargeTime", a.status,
      hp._id AS hp_id, hp.name AS hp_name,
      t._id AS test_id, t.name AS test_name, t.equip AS test_equip
    FROM Doctor d
    LEFT JOIN Sits_at sa ON d._id = sa.did
    LEFT JOIN Room r ON r._id = sa.rid
    LEFT JOIN Treats tr ON d._id = tr.did
    LEFT JOIN Appointment a ON a._id = tr.aid
    LEFT JOIN Supervises s ON s.did = d._id
    LEFT JOIN hospital_professional hp ON hp._id = s.hid
    LEFT JOIN doctortest dt ON dt.did = d._id
    LEFT JOIN Test t ON t._id = dt.tid
    WHERE d.active = TRUE AND $1::time BETWEEN d."inTime"::time AND d."outTime"::time
  `;

  return await client.query(query, [time]);
};


const getAllCurrentNursesQuery = async (shift) => {
  const query = `
    SELECT
      n._id AS nurse_id, n.name AS nurse_name, n.addr, n.email, n.gender, 
      n.role, n.shift, n."userName", n."phoneNumber",
      a._id AS appointment_id, a."time", a."dischargeTime", a.status,
      t._id AS test_id, t.name AS test_name, t.equip AS test_equip,
      r._id AS room_id, r.name AS room_name
    FROM Nurse n
    LEFT JOIN looks_after la ON la.nid = n._id
    LEFT JOIN Appointment a ON a._id = la.aid
    LEFT JOIN nursetest nt ON nt.nid = n._id
    LEFT JOIN Test t ON t._id = nt.tid
    LEFT JOIN testroom troom ON troom.tid = t._id
    LEFT JOIN Room r ON r._id = troom.rid
    WHERE n.active = TRUE;
  `;

  return await client.query(query);
};

const getAllCurrentAppointmentsQuery = async () => {
  const result = await client.query(`
    SELECT
        a._id AS appointment_id,
        a.time,
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

        FROM
        appointment a

        -- Patient
        LEFT JOIN ptakes pt ON pt.aid = a._id
        LEFT JOIN patient p ON pt.pid = p._id

        -- Doctor
        LEFT JOIN treats trt ON trt.aid = a._id
        LEFT JOIN doctor d ON trt.did = d._id

        -- Doctor's Room
        LEFT JOIN sits_at sa ON sa.did = d._id
        LEFT JOIN room r ON sa.rid = r._id

        -- Bed
        LEFT JOIN stays_at sa2 ON sa2.aid = a._id
        LEFT JOIN bed b ON sa2.bid = b._id

        -- Bed join room
        LEFT JOIN roomhasbed rhb ON rhb.bid = b._id
        LEFT JOIN room r2 on r2._id = rhb.rid

        -- Drug
        LEFT JOIN prescription pr ON pr.aid = a._id
        LEFT JOIN drugs dr ON pr.dgid = dr._id

        -- Disease
        LEFT JOIN apphasdis ad ON ad.aid = a._id
        LEFT JOIN disease dis ON ad.disid = dis._id

        -- Test
        LEFT JOIN apptakest at ON at.aid = a._id
        LEFT JOIN test t ON at.tid = t._id
        LEFT JOIN testroom trm ON trm.tid = t._id
        LEFT JOIN room tr ON trm.rid = tr._id
        LEFT JOIN doctortest dtj ON dtj.tid = t._id
        LEFT JOIN doctor dt ON dtj.did = dt._id

        -- Nurse
        LEFT JOIN looks_after la ON la.aid = a._id
        LEFT JOIN nurse n ON la.nid = n._id

        -- Hospital Professional
        LEFT JOIN study s ON s.aid = a._id
        LEFT JOIN hospital_professional hp ON s.hid = hp._id

        WHERE a.active = TRUE AND a.status IN ('Scheduled', 'InProgress');
  `);

  return result.rows;
};


export {
  getAllHospitalStaffQuery,
  getThisHospitalStaffQuery,
  createHospitalStaffQuery,
  updateHospitalStaffQuery,
  deleteHospitalStaffQuery,
  getAllCurrentDoctorsQuery,
  getAllCurrentNursesQuery,
  getAllCurrentAppointmentsQuery
}