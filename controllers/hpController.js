import Hospital_Professional from '../models/hpModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllHospitalProfessional = tryCatch(async (req, res) => {
  const allHp = await Hospital_Professional.find({active : true});
  return res.status(200).json({ success: true, data: allHp });
});

const getThisHospitalProfessional = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const user = await Hospital_Professional.find({ name, active : true });
  if (!user) return next(new ErrorHandler("Incorrect user name", 404));
  return res.status(200).json({ success: true, user: user });
});

const createHospitalProfessional = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email, gender, uni, degree, supervisedBy
  } = req.body;

  if (!name || !addr || !phoneNumber || !email || !uni || !degree)
    return next(new ErrorHandler("Insufficient input", 404));

  const password = "password";
  await Hospital_Professional.create({name, addr, phoneNumber, email, gender, uni, degree, supervisedBy, password});
  return res.status(200).json({ success: true });
});


const updateHospitalProfessional = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const updatedHP = await Hospital_Professional.findByIdAndUpdate(id, updateFields, { new: true });

  if (!updatedHP) {
    return next(new ErrorHandler("Hospital Professional not found", 404));
  }

  return res.status(200).json({ message: 'Hospital Professional updated successfully', hospitalProfessional: updatedHP });
});

const deleteHospitalProfessional = tryCatch(async(req, res, next) => {
  const { id } = req.body;
  const hp = await Hospital_Professional.findById(id);
  if(!hp) return next(new ErrorHandler("Hospital Professional not found",404));
  hp.active = false;
  await hp.save();
  return res.status(200).json({message : 'Hospital Professional deleted successfully'});
});

export { 
  getAllHospitalProfessional, 
  getThisHospitalProfessional, 
  createHospitalProfessional, 
  updateHospitalProfessional,
  deleteHospitalProfessional
}
