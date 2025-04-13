import  client  from  "../db.js";

const getAllDrugQuery = async () => {
    return await client.query('SELECT * FROM Drugs WHERE active = TRUE ;');
};

const getThisDrugQuery = async (name) => {
    return await client.query(`SELECT * FROM Drugs WHERE active = TRUE and name = $1 ;`, [name]);
};

const createDrugQuery = async (name, composition) => {
    return await client.query(
        'INSERT INTO Drugs (name, composition, active) VALUES ($1, $2, TRUE) RETURNING *;',
        [name, composition]
    );
};

const updateDrugQuery = async (id, name, composition) => {
    return await client.query(
        'UPDATE Drugs SET name = $1, composition = $2 WHERE _id = $3 RETURNING *;',
        [name, composition, id]
    );
};

const deleteDrugQuery = async (id) => {
    return await client.query(
        'UPDATE Drugs SET active = FALSE WHERE _id = $1;',
        [id]
    );
};

export {getAllDrugQuery , getThisDrugQuery , createDrugQuery, updateDrugQuery, deleteDrugQuery}