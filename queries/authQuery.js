import  client  from  "../db.js";

const doctorQuery = async (type,value) =>{
    const { rows } =  await client.query(`
        SELECT 
          d.*, 
          t._id AS test_id, t.name AS test_name,
          tr.rid AS test_room_id, r.name AS test_room_name,
          h._id AS hps_id, h.name AS hps_name
        FROM doctor d
        LEFT JOIN doctortest dt ON dt.did = d._id
        LEFT JOIN test t ON t._id = dt.tid
        LEFT JOIN testroom tr ON tr.tid = t._id
        LEFT JOIN room r ON r._id = tr.rid
        LEFT JOIN supervises s ON s.did = d._id
        LEFT JOIN hospital_professional h ON h._id = s.hid
        WHERE d.${type} = $1 AND d.active = TRUE
    `,[value]);
    if (rows.length === 0) return null;
  
    const doctor = {
        _id: rows[0]._id,
        name: rows[0].name,
        gender: rows[0].gender,
        phoneNumber: rows[0].phone,
        inTime: rows[0].in_time,
        outTime: rows[0].out_time,
        specialization: rows[0].specialization,
        active: rows[0].active,

        tests: [],
        supervisedBy: [],
    };

    const testMap = new Map();
    const supervisorMap = new Map();

    for (const row of rows) {
    if (row.test_id && !testMap.has(row.test_id)) {
        testMap.set(row.test_id, {
        _id: row.test_id,
        name: row.test_name,
        room: row.test_room_id ? {
            _id: row.test_room_id,
            name: row.test_room_name,
        } : undefined,
        });
    }

    if (row.hps_id && !supervisorMap.has(row.hps_id)) {
        supervisorMap.set(row.hps_id, {
        _id: row.hps_id,
        name: row.hps_name,
        });
    }
    }

    doctor.tests = [...testMap.values()];
    doctor.supervisedBy = [...supervisorMap.values()];

    return doctor;
}

const nurseQuery = async(type,value) =>{
    const { rows } = await client.query(`
        SELECT 
          n.*, 
          t._id AS test_id, 
          t.name AS test_name
        FROM nurse n
        LEFT JOIN nursetest nt ON nt.nid = n._id
        LEFT JOIN test t ON t._id = nt.tid
        WHERE n.${type} = $1 AND n.active = TRUE
    `, [value]);
  
    if (rows.length === 0) return null;

    const nurse = {
        _id: rows[0]._id,
        name: rows[0].name,
        gender: rows[0].gender,
        phoneNumber: rows[0].phone,
        shift: rows[0].shift,
        active: rows[0].active,

        tests: [],
    };

    const testMap = new Map();

    for (const row of rows) {
    if (row.test_id && !testMap.has(row.test_id)) {
        testMap.set(row.test_id, {
        _id: row.test_id,
        name: row.test_name,
        });
    }
    }

    nurse.tests = [...testMap.values()];
    return nurse;
}

const hospitalStaffQuery = async (type,value) => {
    const { rows } = await client.query(`
    SELECT * FROM hospital_staff WHERE ${type} = $1 AND active = TRUE
    `, [value]);

    return rows[0];
}

export {
    doctorQuery,
    nurseQuery,
    hospitalStaffQuery
}
  