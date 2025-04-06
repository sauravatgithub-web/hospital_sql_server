import Room from '../models/roomModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllRoom = tryCatch(async(req, res) => {
  const allRoom = await Room.find();
  return res.status(200).json({ success: true, data: allRoom });
});

const getThisRoom = tryCatch(async(req, res, next) => {
  const name = req.params.name;
  const room = await Room.find({name});
  if(!room) return next(new ErrorHandler("Incorrect room name", 404));
  return res.status(200).json({ success: true, patient : patient });
});

const createRoom = tryCatch(async (req, res, next) => {
    const { type, capacity, isAC } = req.body;
    if(!type || !capacity || !isAC) return next(new ErrorHandler("Insufficient input", 400));
    console.log(type, capacity, isAC);
  
    const newRoom = await Room.create({
      type,
      capacity,
      isAC
    });
  
    return res.status(200).json({ success: true, message: "Room created", room: newRoom });
  });
  
const updateRoom = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const updateFields = req.body;
  
    const updatedRoom = await Room.findByIdAndUpdate(id, updateFields, { new: true });
  
    if (!updatedRoom)
      return next(new ErrorHandler("Room not found", 404));
  
    return res.status(200).json({ success: true, message: "Room updated", room: updatedRoom });
  });
  


export {getAllRoom, getThisRoom, createRoom, updateRoom}