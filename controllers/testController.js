import Test from '../models/testModel.js';
import Room from '../models/roomModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllTest = tryCatch(async (req, res) => {
  const allTest = await Test.find({active : true});
  const modifiedTests = allTest.map(test => ({
    _id: test._id,
    name: test.tname,
    equip: test.tequip,
    room: test.room,
    doctor: test.doctor,
    nurse: test.nurse,
  }))
  return res.status(200).json({ success: true, data: modifiedTests });
});


const getThisTest = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const test = await Test.find({ tname: name, active : true });
  if (!test) return next(new ErrorHandler("Incorrect test name", 404));
  return res.status(200).json({ success: true, test: test });
});

const createTest = tryCatch(async (req, res, next) => {
  const { name, equip, room, doctor, nurse } = req.body;
  console.log(req.body);

  if (!name || !equip)
    return next(new ErrorHandler("Insufficient input", 400));

  const reqData = {
    tname: name,
    tequip: equip,
    room, doctor, nurse
  }
  const roomData = await Room.findById(room);
  if (!roomData || roomData.vacancy <= 0) return next(new ErrorHandler("Room is full", 400));

  const newTest = await Test.create(reqData);
  roomData.vacancy -= 1;
  await roomData.save();

  return res.status(200).json({ success: true, message: "Test created", test: newTest });
});


const updateTest = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const updateFields = req.body;

  const updatedTest = await Test.findByIdAndUpdate(id, updateFields, { new: true });
  if (!updatedTest) return next(new ErrorHandler("Test not found", 404));

  return res.status(200).json({ success: true, message: "Test updated", test: updatedTest });
});

const deleteTest = tryCatch(async(req, res, next) => {
  const { name } = req.params;
  const test = await Test.find({ name });
  if(!test) return next(new ErrorHandler("Test not found",404));
  test.active = false;
  await test.save();
  return res.status(200).json({message : 'Test deleted successfully'});
});

export { getAllTest, getThisTest, createTest, updateTest, deleteTest }