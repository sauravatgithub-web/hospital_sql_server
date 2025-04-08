import Room from '../models/roomModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllRoom = tryCatch(async (req, res) => {
  const allRoom = await Room.find({active : true});
  return res.status(200).json({ success: true, data: allRoom });
});

const getThisRoom = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const room = await Room.find({ name, active : true });
  if (!room) return next(new ErrorHandler("Incorrect room name", 404));
  return res.status(200).json({ success: true, patient: patient });
});

const getAllVacantDocRooms = tryCatch(async (req, res) => {
  const allRooms = await Room.find({ type: 'Consultation', vacancy: 1, active : true });
  return res.status(200).json({ success: true, data: allRooms });
});

const getAllVacantRooms = tryCatch(async (req, res) => {
  const { type } = req.query;

  if (!type) {
    return res.status(400).json({ success: false, message: "Room type is required" });
  }

  const typeArray = Array.isArray(type) ? type : [type];

  const allRooms = await Room.find({
    type: { $in: typeArray },
    vacancy: { $gt: 0 },
    active : true
  });

  return res.status(200).json({ success: true, data: allRooms });
});



const createRoom = tryCatch(async (req, res, next) => {
  const { name, type, capacity, isAC } = req.body;
  if (!name || !type || !capacity || !isAC) return next(new ErrorHandler("Insufficient input", 400));

  const newRoom = await Room.create({
    name,
    type,
    capacity,
    isAC
  });

  return res.status(200).json({ success: true, message: "Room created", room: newRoom });
});

const updateRoom = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const updateFields = req.body;

  const updatedRoom = await Room.findByIdAndUpdate(id, updateFields, { new: true });

  if (!updatedRoom)
    return next(new ErrorHandler("Room not found", 404));

  return res.status(200).json({ success: true, message: "Room updated", room: updatedRoom });
});

const deleteRoom = tryCatch(async(req, res, next) => {
  const { name } = req.params;
  const room = await Room.find({ name });
  if(!room) return next(new ErrorHandler("Room not found",404));
  room.active = false;
  await room.save();
  return res.status(200).json({message : 'Room deleted successfully'});
});

export { getAllRoom, getThisRoom, getAllVacantDocRooms, getAllVacantRooms, createRoom, updateRoom, deleteRoom }