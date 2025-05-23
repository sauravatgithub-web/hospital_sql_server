import Test from '../models/testModel.js';
import Room from '../models/roomModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import Doctor from '../models/doctorModel.js';
import Nurse from '../models/nurseModel.js';

const getAllTest = tryCatch(async (req, res) => {
  const allTests = await Test.find({active : true});
  return res.status(200).json({ success: true, data: allTests });
});

const getThisTest = tryCatch(async (req, res, next) => {
  const id = req.params.id;
  const test = await Test.findOne({ _id: id, active : true });
  if (!test) return next(new ErrorHandler("Incorrect test name", 404));
  return res.status(200).json({ success: true, test: test });
});

const createTest = tryCatch(async (req, res, next) => {
  const { name, equip, room, doctor, nurse } = req.body;
  if (!name || !equip) return next(new ErrorHandler("Insufficient input", 400));

  const roomData = await Room.findById(room);
  if (!roomData || roomData.vacancy <= 0) return next(new ErrorHandler("Room is full", 400));

  const newTest = await Test.create({ name, equip, room, doctor, nurse });
  roomData.vacancy -= 1;
  await roomData.save();

  const doctorData = await Doctor.findById({ _id: doctor });
  doctorData.tests.push(newTest._id);
  await doctorData.save();

  const nurseData = await Nurse.findById({ _id: nurse });
  nurseData.tests.push(newTest._id);
  await nurseData.save();

  roomData.tests.push(newTest._id);
  await roomData.save();

  return res.status(200).json({ success: true, message: "Test created", test: newTest });
});


const updateTest = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const updatedFields = req.body;

  const test = await Test.findById(id);

  if(test.doctor !== updatedFields.doctor) {
    const oldDoctor = await Doctor.findById(test.doctor);
    oldDoctor.tests.filter(test => test !== id);
    await oldDoctor.save();

    const newDoctor = await Doctor.findById(updatedFields.doctor);
    newDoctor.tests.push(id);
    await newDoctor.save();
  }

  if(test.nurse !== updatedFields.nurse) {
    const oldNurse = await Nurse.findById(test.nurse);
    oldNurse.tests.filter(test => test !== id);
    await oldNurse.save();

    const newNurse = await Nurse.findById(updatedFields.nurse);
    newNurse.tests.push(id);
    await newNurse.save();
  }

  if(test.room !== updatedFields.room) {
    const oldRoom = await Room.findById(test.room);
    oldRoom.tests.filter(test => test !== id);
    await oldRoom.save();

    const newRoom = await Room.findById(updatedFields.room);
    newRoom.tests.push(id);
    await newRoom.save();
  }

  const updatedTest = await Test.findByIdAndUpdate(id, updatedFields, { new: true });
  if (!updatedTest) return next(new ErrorHandler("Test not found", 404));

  return res.status(200).json({ success: true, message: "Test updated", test: updatedTest });
});

const deleteTest = tryCatch(async(req, res, next) => {
  const { id } = req.body;
  const test = await Test.findById(id);
  if(!test) return next(new ErrorHandler("Test not found",404));
  test.active = false;
  await test.save(); 
  return res.status(200).json({success: true, message : 'Test deleted successfully'});
});

export { 
  getAllTest, 
  getThisTest, 
  createTest, 
  updateTest, 
  deleteTest 
}