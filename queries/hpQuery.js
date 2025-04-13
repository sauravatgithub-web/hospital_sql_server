import client from '../db.js';

export const getAllHospitalProfessionalsQuery = async () => {
  return await client.query(`SELECT * FROM hospital_professional WHERE active = TRUE;`);
};

export const getOneHospitalProfessionalQuery = async (id) => {
  return await client.query(`SELECT * FROM hospital_professional WHERE id = $1 AND active = TRUE;`, [id]);
};

export const createHospitalProfessionalQuery = async (data) => {
  const { name, addr, phoneNumber, email, gender, uni, degree, password } = data;
  return await client.query(`
    INSERT INTO hospital_professional (name, addr, phone_number, email, gender, uni, degree, password)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;`,
    [name, addr, phoneNumber, email, gender, uni, degree, password]
  );
};

export const insertDoctorHpRelationQuery = async (doctorId, hpId) => {
  return await client.query(`
    INSERT INTO doctor_hp (doctor_id, hp_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;`,
    [doctorId, hpId]
  );
};

export const deleteDoctorHpRelationQuery = async (doctorId, hpId) => {
  return await client.query(`
    DELETE FROM doctor_hp WHERE doctor_id = $1 AND hp_id = $2;`,
    [doctorId, hpId]
  );
};

export const updateHospitalProfessionalQuery = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

  return await client.query(
    `UPDATE hospital_professional SET ${setClause} WHERE id = $1;`,
    [id, ...values]
  );
};

export const getUpdatedHospitalProfessionalQuery = async (id) => {
  return await client.query(`SELECT * FROM hospital_professional WHERE id = $1;`, [id]);
};

export const softDeleteHospitalProfessionalQuery = async (id) => {
  return await client.query(`UPDATE hospital_professional SET active = false WHERE id = $1 RETURNING *;`, [id]);
};
