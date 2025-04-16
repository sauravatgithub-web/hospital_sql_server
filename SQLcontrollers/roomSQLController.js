import {
  getAllRoomQuery,
  getThisRoomQuery,
  createRoomQuery,
  updateRoomQuery,
  deleteRoomQuery,
  getAllVacantDocRoomsQuery,
  getAllVacantRoomsByTypeQuery,
  useGetAllVacantBedsQuery
} from '../queries/roomQuery.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllRoom = tryCatch(async (req, res) => {
  const result = await getAllRoomQuery();
  return res.status(200).json({ success: true, data: result.rows });
});


const getThisRoom = tryCatch(async (req, res, next) => {
  const id = req.params.id;
  const result = await getThisRoomQuery(id);
  if (result.rows.length === 0) {
    return next(new ErrorHandler("Incorrect room id", 404));
  }
  return res.status(200).json({ success: true, room: result.rows[0] });
});


const createRoom = tryCatch(async (req, res, next) => {
  const { name, type, capacity, isAC } = req.body;
  if (!name || !type || !capacity || !isAC) {
    return next(new ErrorHandler("Insufficient input", 400));
  }

  const result = await createRoomQuery(name, type, capacity, isAC);
  return res.status(201).json({ message: 'Room created successfully', room: result });
});


const updateRoom = tryCatch(async (req, res, next) => {
  const { id, name, type, capacity, isAC } = req.body;
  const result = await updateRoomQuery(id, name, type, capacity, isAC);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Room not found", 404));
  }
  return res.status(200).json({ message: 'Room updated successfully', room: result });
});


const deleteRoom = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteRoomQuery(id);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Room not found", 404));
  }
  return res.status(200).json({ message: 'Room deleted successfully' });
});

const getAllVacantDocRooms = tryCatch(async (req, res) => {
  const result = await getAllVacantDocRoomsQuery();
  return res.status(200).json({ success: true, data: result.rows });
});

// {
//   roomName : [{bed_id, bed_name}]
// }

const getAllVacantBeds = tryCatch(async (req, res) => {
  const rawResult = await useGetAllVacantBedsQuery();

  const formatted = {};

  rawResult.rows.forEach(row => {
    const { roomName, _id, name } = row;

    if (!formatted[roomName]) {
      formatted[roomName] = [];
    }

    if (_id && name) {
      formatted[roomName].push({ _id, name });
    }
  });

  return res.status(200).json({ success: true, data: formatted });
})

const getAllVacantRooms = tryCatch(async (req, res) => {
  const { type } = req.query;

  if (!type) {
    return res.status(400).json({ success: false, message: "Room type is required" });
  }

  const typeArray = Array.isArray(type) ? type : [type];
  const result = await getAllVacantRoomsByTypeQuery(typeArray);

  return res.status(200).json({ success: true, data: result.rows });
});


export {
  getAllRoom,
  getThisRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllVacantDocRooms,
  getAllVacantRooms,
  getAllVacantBeds
}