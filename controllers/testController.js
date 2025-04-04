import Test from '../models/testModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createTest = tryCatch(async (req, res, next) => {
    const { name, equip, appointment, room } = req.body;
  
    if (!name || !equip)
      return next(new ErrorHandler("Insufficient input", 400));
    
    const reqData = {
      tname : name,
      tequip : equip,
      appointment,
      room
    }
    const newTest = await Test.create({reqData});
    return res.status(200).json({ success: true, message: "Test created", test: newTest });
  });
  
  
const updateTest = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const updateFields = req.body;
  
    const updatedTest = await Test.findByIdAndUpdate(id, updateFields, { new: true });
  
    if (!updatedTest)
      return next(new ErrorHandler("Test not found", 404));
  
    return res.status(200).json({ success: true, message: "Test updated", test: updatedTest });
});
  

export {createTest, updateTest}