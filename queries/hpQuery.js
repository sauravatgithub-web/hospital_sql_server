import client from '../db.js';

const getAllHospitalProfessionalsQuery = async () => {
  return await client.query(`
    SELECT 
      hp.*, 
      COALESCE(
        json_agg(
          json_build_object('_id', d._id, 'name', d.name)
        ) FILTER (WHERE d._id IS NOT NULL), 
        '[]'
      ) AS "supervisedBy"
    FROM 
      hospital_professional hp
    LEFT JOIN 
      Supervises dh ON hp._id = dh.hid
    LEFT JOIN 
      Doctor d ON dh.did = d._id
    WHERE 
      hp.active = TRUE
    GROUP BY 
      hp._id;
  `);
};


const getOneHospitalProfessionalQuery = async (id) => {
  return await client.query(`SELECT * FROM hospital_professional WHERE id = $1 AND active = TRUE;`, [id]);
};

const createHospitalProfessionalQuery = async (data) => {
  const { name, addr, phoneNumber, email, gender, uni, degree } = data;

  const userName  = (()=> {
    const namePart = name.toLowerCase().split(' ');
    const emailPart = email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  return await client.query(`
    INSERT INTO hospital_professional (name, addr, "phoneNumber", email, gender, uni, degree, "userName")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING _id;`,
    [name, addr, phoneNumber, email, gender, uni, degree, userName]
  );
};

const insertDoctorHpRelationQuery = async (did, hid) => {
  return await client.query(`
    INSERT INTO Supervises (did, hid)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;`,
    [did, hid]
  );
};

const deleteDoctorHpRelationQuery = async (did, hid) => {
  return await client.query(`
    DELETE FROM doctor_hp WHERE did = $1 AND hid = $2;`,
    [did, hid]
  );
};

const updateHospitalProfessionalQuery = async (id, fields) => {
  fields["userName"] = (() => {
    const namePart = fields.name.toLowerCase().split(' ');
    const emailPart = fields.email.toLowerCase().split('@')[0];
    return `${namePart.join('_')}_${emailPart}`;
  })();

  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys.map((field, i) => `"${field}" = $${i + 2}`).join(", ");
  return await client.query(
    `UPDATE hospital_professional SET ${setClause} WHERE _id = $1;`,
    [id, ...values]
  );
};

const getUpdatedHospitalProfessionalQuery = async (id) => {
  return await client.query(`SELECT * FROM hospital_professional WHERE _id = $1 and active = TRUE;`, [id]);
};

const deleteHospitalProfessionalQuery = async (id) => {
  return await client.query(`UPDATE hospital_professional SET active = false WHERE id = $1 RETURNING *;`, [id]);
};

export {
  getAllHospitalProfessionalsQuery,
  getOneHospitalProfessionalQuery,
  createHospitalProfessionalQuery,
  insertDoctorHpRelationQuery,
  deleteDoctorHpRelationQuery,
  updateHospitalProfessionalQuery,
  getUpdatedHospitalProfessionalQuery,
  deleteHospitalProfessionalQuery
}
