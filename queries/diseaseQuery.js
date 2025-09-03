import  client  from  "../db.js";

const getAllDiseaseQuery = async () => {
    return await client.query('SELECT * FROM Disease WHERE active = TRUE ;');
};

const getThisDiseaseQuery = async (name) => {
    return await client.query(`SELECT * FROM Disease WHERE active = TRUE and name = $1 ;`, [name]);
};

const createDiseaseQuery = async (name, symp, desc) => {
    return await client.query(
        'INSERT INTO Disease (name, symp, "description", active) VALUES ($1, $2, $3, TRUE) RETURNING *;',
        [name, symp, desc]
    );
};

const updateDiseaseQuery = async (id, name, symp, desc) => {
    return await client.query(
        'UPDATE Disease SET name = $1, symp = $2, "description" = $3 WHERE _id = $4 RETURNING *;',
        [name, symp, desc , id]
    );
};

const deleteDiseaseQuery = async (id) => {
    return await client.query(
        'UPDATE Disease SET active = FALSE WHERE _id = $1;',
        [id]
    );
};

export {getAllDiseaseQuery , getThisDiseaseQuery , createDiseaseQuery, updateDiseaseQuery, deleteDiseaseQuery}