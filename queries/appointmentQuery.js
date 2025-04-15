import client from "../db.js";

// SQL Query to get all active appointments
const getAllAppointmentsQuery = async () => {
  const result = await client.query('SELECT * FROM appointment WHERE active = TRUE;');
  return result.rows;
};

const getPatientAppointmentsQuery = async (ids) => {
  const result = await client.query(`
    SELECT *
    FROM appointment
    WHERE _id = ANY($1)
  `, [ids]);
  return result.rows;
}

// SQL Query to get specific appointment by ID
const getAppointmentByIdQuery = async (id) => {
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

        WHERE
        a._id = $1 AND a.active = TRUE;
    `, [id]);

  return result.rows;
};

// SQL Query to create a new appointment
const createAppointmentQuery = async (time, patient, doctor, user) => {
  const result = await client.query(`
        INSERT INTO appointment (time, status)
        VALUES ($1, 'Scheduled') RETURNING *;
    `, [time]);

  const aid = result.rows[0]._id;

  await client.query(`INSERT INTO ptakes (aid, pid, sid) VALUES ($1, $2, $3);`, [aid, patient, user]);
  await client.query(`INSERT INTO treats (aid, did) VALUES ($1, $2);`, [aid, doctor]);

  return result.rows[0];
};

// SQL Query to update an appointment
// const updateAppointmentQuery = async ({
//   id,time,
//   dischargeTime,status,
//   doctorId,patientId,
//   nurseIds = [],
//   test = [],
//   hps = [],
//   disease = [],
//   roomId,bedId,
//   drugDetails = [],
//   remarks = []
// }) => {
//   try {
//     await client.query('BEGIN');

//     // Update doctor-appointment
//     await client.query(`DELETE FROM treats WHERE aid = $1`, [id]);
//     await client.query(`INSERT INTO treats(did, aid) VALUES ($1, $2)`, [doctorId, id]);

//     // Update nurse-appointment
//     await client.query(`DELETE FROM looks_after WHERE aid = $1`, [id]);
//     for (const nid of nurseIds) {
//       await client.query(`INSERT INTO looks_after(nid, aid) VALUES ($1, $2)`, [nid, id]);
//     }

//     // Update HPS
//     await client.query(`DELETE FROM study WHERE aid = $1`, [id]);
//     for (const hid of hps) {
//       await client.query(`INSERT INTO study(aid, hid) VALUES ($1, $2)`, [id, hid]);
//     }

//     // Update diseases
//     await client.query(`DELETE FROM apphasdis WHERE aid = $1`, [id]);
//     for (const disid of disease) {
//       await client.query(`INSERT INTO apphasdis(aid, disid) VALUES ($1, $2)`, [id, disid]);
//     }

//     // Update tests
//     await client.query(`DELETE FROM apptakest WHERE aid = $1`, [id]);
//     for (const { testId, remark } of test) {
//       await client.query(`INSERT INTO apptakest(aid, tid, remarkmsg) VALUES ($1, $2, $3)`, [id, testId, remark]);
//     }

//     // Update bed
//     await client.query(`DELETE FROM stays_at WHERE aid = $1`, [id]);
//     await client.query(`INSERT INTO stays_at(aid, bid) VALUES ($1, $2)`, [id, bedId]);

//     // Update drugs
//     await client.query(`DELETE FROM prescription WHERE aid = $1`, [id]);
//     for (const { drugId, dosage } of drugDetails) {
//       await client.query(`INSERT INTO prescription(aid, dgid, dosage) VALUES ($1, $2, $3)`, [id, drugId, dosage]);
//     }

//     // insert remarks into a separate `appointment_remarks` table
//     for (const { remarkUser, remarkUserRole, remarkMsg } of remarks) {
//       if (remarkUserRole === "Nurse") {
//         await client.query(`
//                 INSERT INTO looks_after(nid, aid, remarktime, remarkmsg)
//                 VALUES ($1, $2, NOW(), $3)
//               `, [, id, remarkUser, remarkUserRole, remarkMsg]);
//       }
//       else{
//           await client.query(`
//               INSERT INTO treats(aid,did, remarktime, remarkmsg)
//               VALUES ($1, $2, NOW(), $3)
//             `, [id, doctorId, remarkMsg]);
//       }
//     }

//     await client.query('COMMIT');
//     return { success: true };
//   } catch (err) {
//     await client.query('ROLLBACK');
//     throw err;
//   } 
// };

const updateAppointmentQuery = async ({
  id,
  doctor,
  nurse = [],
  tests = [],
  hps = [],
  disease = [],
  room, bed,
  drugs = [],
  remarks
}) => {
  try {
    await client.query('BEGIN');

    // Doctor
    if (doctor) {
      await client.query(`DELETE FROM treats WHERE aid = $1`, [id]);
      await client.query(`INSERT INTO treats(did, aid) VALUES ($1, $2)`, [doctor, id]);
    }

    // Nurse
    if (Array.isArray(nurse) && nurse.length > 0) {
      await client.query(`DELETE FROM looks_after WHERE aid = $1`, [id]);
      for (const nid of nurse) {
        await client.query(`INSERT INTO looks_after(nid, aid) VALUES ($1, $2)`, [nid, id]);
      }
    }

    // HPS
    if (Array.isArray(hps) && hps.length > 0) {
      await client.query(`DELETE FROM study WHERE aid = $1`, [id]);
      for (const hid of hps) {
        await client.query(`INSERT INTO study(aid, hid) VALUES ($1, $2)`, [id, hid]);
      }
    }

    // Diseases
    if (Array.isArray(disease) && disease.length > 0) {
      await client.query(`DELETE FROM apphasdis WHERE aid = $1`, [id]);
      for (const disid of disease) {
        await client.query(`INSERT INTO apphasdis(aid, disid) VALUES ($1, $2)`, [id, disid]);
      }
    }

    // Tests
    if (Array.isArray(tests) && tests.length > 0) {
      await client.query(`DELETE FROM apptakest WHERE aid = $1`, [id]);
      for (const { test, remark } of tests) {
        await client.query(
          `INSERT INTO apptakest(aid, tid, remarkmsg) VALUES ($1, $2, $3)`,
          [id, test._id, remark]
        );
      }
    }

    // Bed
    if (bed) {
      await client.query(`DELETE FROM stays_at WHERE aid = $1`, [id]);
      await client.query(`INSERT INTO stays_at(aid, bid) VALUES ($1, $2)`, [id, bed]);
    }

    // Drugs
    if (Array.isArray(drugs) && drugs.length > 0) {
      await client.query(`DELETE FROM prescription WHERE aid = $1`, [id]);
      for (const { drug, dosage } of drugs) {
        await client.query(
          `INSERT INTO prescription(aid, dgid, dosage) VALUES ($1, $2, $3)`,
          [id, drug, dosage]
        );
      }
    }

    // Remarks
    if (remarks) {
      const { remarkUserId, remarkUserRole, remarkMsg } = remarks;

      if (remarkUserRole === "Nurse") {
        await client.query(
          `INSERT INTO looks_after(nid, aid, remarktime, remarkmsg) VALUES ($1, $2, NOW(), $3)`,
          [remarkUserId, id, remarkMsg]
        );
      } else {
        await client.query(
          `INSERT INTO treats(aid, did, remarktime, remarkmsg) VALUES ($1, $2, NOW(), $3)`,
          [id, remarkUserId, remarkMsg]
        );
      }
    }


    await client.query('COMMIT');
    // return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
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
  let whereClause = '';
  if (entity === "doctor") {
    whereClause = `trt.did`;
  } else if (entity === "nurse") {
    whereClause = `la.nid`;
  }

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

        WHERE ${whereClause} = $1 AND a.active = TRUE AND a.status = 'InProgress';
    `, [_id]);

  return result.rows;
};


const dischargeAppointmentQuery = async (id, dischargeTime) => {
  return await client.query(`
        UPDATE appointment SET status = 'Completed', "dischargeTime" = $1
        WHERE _id = $2 RETURNING *;
    `, [dischargeTime, id]);
};

export {
  getAllAppointmentsQuery,
  getAppointmentByIdQuery,
  getPatientAppointmentsQuery,
  createAppointmentQuery,
  updateAppointmentQuery,
  deleteAppointmentQuery,
  getCurrentAppointmentsQuery,
  dischargeAppointmentQuery
}