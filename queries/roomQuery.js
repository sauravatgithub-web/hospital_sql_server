import  client  from  "../db.js";

const getAllRoomQuery = async () => {
    return await client.query('SELECT * FROM Room WHERE active = TRUE ;');
};

const getThisRoomQuery = async (id) => {
    return await client.query(`SELECT * FROM Room WHERE active = TRUE and id = $1 ;`, [id]);
};

const createRoomQuery = async (name, type, capacity, isAC) => {
    try {
      await client.query('BEGIN');
  
      // Step 1: Create room
      const roomResult = await client.query(
        'INSERT INTO Room (name, type, capacity, "isAC", active, vacancy) VALUES ($1, $2, $3, $4, TRUE, $3) RETURNING *;',
        [name, type, capacity, isAC]
      );
  
      const room = roomResult.rows[0];
  
      // Step 2: Create beds
      for (let i = 1; i <= capacity; i++) {
        const bedName = `${room.name}-Bed-${i}`;
  
        // Insert bed
        const bedResult = await client.query(
          'INSERT INTO Bed (name, "isOccupied") VALUES ($1, FALSE) RETURNING *;',
          [bedName]
        );
  
        const bed = bedResult.rows[0];
  
        // Associate bed with room
        await client.query(
          'INSERT INTO roomhasbed (bid, rid) VALUES ($1, $2);',
          [bed._id, room._id]
        );
      }
  
      await client.query('COMMIT');
      return room;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
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

const getAllVacantDocRoomsQuery = async () => {
    return await client.query(`
      SELECT * FROM Room 
      WHERE type = 'Consultation' 
        AND vacancy = 1 
        AND active = TRUE;
    `);
  };
  
  const getAllVacantRoomsByTypeQuery = async (typeArray) => {
    const placeholders = typeArray.map((_, i) => `$${i + 1}`).join(", ");
    return await client.query(`
      SELECT * FROM Room
      WHERE type IN (${placeholders})
        AND vacancy > 0
        AND active = TRUE;
    `, typeArray);
  };

export {getAllRoomQuery , 
        getThisRoomQuery , 
        createRoomQuery, 
        updateRoomQuery, 
        deleteRoomQuery, 
        getAllVacantDocRoomsQuery,
        getAllVacantRoomsByTypeQuery
    }