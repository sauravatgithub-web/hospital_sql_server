import Patient from '../models/patientModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllPatient = tryCatch(async (req, res) => {
  const allPatients = await Patient.find({active : true});
  return res.status(200).json({ success: true, data: allPatients });
});

const getThisPatient = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const patient = await Patient.findOne({ pname: name, active : true });
  if (!patient) return next(new ErrorHandler("Incorrect patient name", 404));
  return res.status(200).json({ success: true, patient: patient });
});

const getPatientByNumber = tryCatch(async (req, res, next) => {
  const number = req.params.phoneNo;
  const patientData = await Patient.findOne({ phoneNumber: number }).populate({
    path: 'appointments',
    select: '_id time dischargeTime status'
  });
  if(!patientData) return next(new ErrorHandler("No match found", 404));
  return res.status(200).json({ success: true, patient: patientData });
})

const createPatient = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email,
    gender, gname, gPhoneNo, age, role
  } = req.body;

  if (!name || !phoneNumber || !gname || !gPhoneNo || !email)
    return next(new ErrorHandler("Insufficient input", 404));

  const password = "password";

  await Patient.create({name, addr, phoneNumber, email,
    gender, gname, gPhoneNo, age, role, password});

  if(role === "FDO") {
    const patient = await Patient.findOne({ email: email }).populate({
      path: 'appointments',
      select: '_id time dischargeTime status'
    });
    return res.status(200).json({ success: true, message: "Patient created", patient: patient });
  }
  
  return res.status(200).json({ success: true, message: "Patient created" });
});

const updatePatient = tryCatch(async (req, res, next) => {
  const { id, role } = req.body;
  delete req.body.id;

  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    req.body, 
    { new: true, runValidators: true }
  );

  if(!updatedPatient) return next(new ErrorHandler("Patient not found", 404));

  if(role === "FDO") {
    const populatedPatient = await Patient.findById(id).populate({
      path: 'appointments',
      select: '_id time dischargeTime status'
    });
    return res.status(200).json({ success: true, message: "Patient updated", patient: populatedPatient });
  }

  return res.status(200).json({ success: true, message: 'Patient updated successfully', patient: updatedPatient });
});


const deletePatient = tryCatch(async(req, res, next) => {
  const { id } = req.body;
  const patient = await Patient.findById(id);
  if(!patient) return next(new ErrorHandler("Patient not found",404));
  patient.active = false;
  await patient.save();
  return res.status(200).json({message : 'Patient deleted successfully'});
});

export { getAllPatient, getThisPatient, getPatientByNumber, createPatient, updatePatient, deletePatient }