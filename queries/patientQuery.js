import  client  from  "../db.js";

const getAllPatientQuery = async () => {
    return await client.query('SELECT * FROM Patient WHERE active = TRUE ;');
};

const getThisPatientQuery = async (id) => {
    return await client.query(`SELECT * FROM Patient WHERE active = TRUE and _id = $1 ;`, [id]);
};

const getPatientByNumberQuery = async (phoneNumber) => {
    return await client.query(`SELECT * FROM Patient WHERE active = TRUE and phoneNumber = $1 ;`, [phoneNumber]);
};

const deletePatientQuery = async (id) => {
    return await client.query(
        'UPDATE Patient SET active = FALSE WHERE _id = $1;',
        [id]
    );
};

export {getAllPatientQuery, getThisPatientQuery, getPatientByNumberQuery, deletePatientQuery}
