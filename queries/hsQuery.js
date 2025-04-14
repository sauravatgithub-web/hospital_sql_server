import  client  from  "../db.js";

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
    
    const userName  = (()=> {
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
  return await client.query(`
    SELECT 
      n._id AS nurse_id, n.name AS nurse_name, n.addr, n.email, n.gender, n.role, n.shift, 
      n."userName", n."phoneNumber", 
      a._id AS appointment_id, a."status", a."time", a."dischargeTime",
      -- r._id AS room_id, r.name AS room_name, r.bed AS room_bed,
      p._id AS patient_id, p.name AS patient_name, p.age, p."phoneNumber", p.gname, p."gPhoneNo", p.addr, p.email, p."userName",
      dis._id AS disease_id, dis.name AS disease_name, 
      doc._id AS doctor_id, doc.name AS doctor_name, doc."phoneNumber" AS doctor_phoneNumber,
      hp._id AS hp_id, hp.name AS hp_name, hp."phoneNumber" AS hp_phoneNumber,
      t._id AS test_id, t.name AS test_name, t.equip AS test_equip
    FROM Nurse n
    LEFT JOIN looks_after la ON la.nid = n._id
    LEFT JOIN Appointment a ON la.aid = a._id
    -- LEFT JOIN Room r ON r._id = a.room
    LEFT JOIN ptakes ON ptakes.aid = a._id
    LEFT JOIN Patient p ON ptakes.pid = p._id
    LEFT JOIN apphasdis ahd ON ahd.aid = a._id
    LEFT JOIN Disease dis ON ahd.disid = dis._id
    LEFT JOIN treats trt ON trt.aid = a._id
    LEFT JOIN Doctor doc ON trt.did = doc._id
    LEFT JOIN hospital_professional hp ON ptakes.sid = hp._id
    LEFT JOIN apptakest at ON a._id = at.aid  -- Assuming a join table for tests
    LEFT JOIN Test t ON at.tid = t._id
    WHERE a.status IN ('InProgress', 'Scheduled');
  `);
};


export {
  getAllHospitalStaffQuery , 
  getThisHospitalStaffQuery , 
  createHospitalStaffQuery, 
  updateHospitalStaffQuery, 
  deleteHospitalStaffQuery, 
  getAllCurrentDoctorsQuery, 
  getAllCurrentNursesQuery, 
  getAllCurrentAppointmentsQuery 
}