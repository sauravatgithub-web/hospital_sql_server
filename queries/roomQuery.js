import  client  from  "../db.js";

const getAllRoomQuery = async () => {
    return await client.query('SELECT * FROM Room WHERE active = TRUE ;');
};

const getThisRoomQuery = async (id) => {
    return await client.query(`SELECT * FROM Room WHERE active = TRUE and id = $1 ;`, [id]);
};

const createRoomQuery = async (name, type,capacity, isAC) => {
    return await client.query(
        'INSERT INTO Room (name, type, capacity, "isAC", active, vacancy) VALUES ($1, $2, $3, $4, TRUE, $3) RETURNING *;',
        [name, type, capacity, isAC]
    );
};

const updateRoomQuery = async (id, name, type, capacity, isAC) => {
    return await client.query(
        'UPDATE Room SET name = $1, type = $2, capacity = $3, "isAC" = $4 WHERE _id = $5 RETURNING *;',
        [name, type, capacity , isAC, id]
    );
};

const deleteRoomQuery = async (id) => {
    return await client.query(
        'UPDATE Room SET active = FALSE WHERE _id = $1;',
        [id]
    );
};

export {getAllRoomQuery , getThisRoomQuery , createRoomQuery, updateRoomQuery, deleteRoomQuery}