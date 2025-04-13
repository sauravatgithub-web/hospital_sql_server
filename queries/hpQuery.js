import client from '../db.js';

const getAllHospitalProfessionalsQuery = async () => {
    return await client.query(`
      SELECT 
        hp.*, 
        json_agg(json_build_object('id', d.id, 'name', d.name)) AS supervisors
      FROM 
        hospital_professional hp
      LEFT JOIN 
        Supervises dh ON hp.id = dh.hid
      LEFT JOIN 
        Doctor d ON dh.did = d.id
      WHERE 
        hp.active = TRUE
      GROUP BY 
        hp.id;
    `);
  };
  

const getOneHospitalProfessionalQuery = async (id) => {
  return await client.query(`SELECT * FROM hospital_professional WHERE id = $1 AND active = TRUE;`, [id]);
};

const createHospitalProfessionalQuery = async (data) => {
  const { name, addr, phoneNumber, email, gender, uni, degree } = data;

  return await client.query(`
    INSERT INTO hospital_professional (name, addr, "phoneNumber", email, gender, uni, degree)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;`,
    [name, addr, phoneNumber, email, gender, uni, degree]
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
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

  return await client.query(
    `UPDATE hospital_professional SET ${setClause} WHERE id = $1;`,
    [id, ...values]
  );
};

const getUpdatedHospitalProfessionalQuery = async (id) => {
  return await client.query(`SELECT * FROM hospital_professional WHERE id = $1;`, [id]);
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
