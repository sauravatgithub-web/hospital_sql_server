import Room from '../models/roomModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createRoom = tryCatch(async (req, res, next) => {
    const { tor, capacity, isAC } = req.body;
  
    if (!tor || !capacity || !isAC)
      return next(new ErrorHandler("Insufficient input", 400));
  
    const newRoom = await Room.create({
      tor,
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
  


export {createRoom, updateRoom}