import Patient from '../models/patientModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllPatient = tryCatch(async (req, res) => {
  const allPatient = await Patient.find({active : true});
  const modifiedPatients = allPatient.map(patient => ({
    _id: patient._id,
    name: patient.pname,
    gender: patient.gender,
    phoneNumber: patient.p_phoneNumber,
    gname: patient.guardian_name,
    gPhoneNumber: patient.guardian_phoneNo,
    addr: patient.paddr,
    userName: patient.p_userName
  }))
  return res.status(200).json({ success: true, data: modifiedPatients });
});


const getThisPatient = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const patient = await Patient.find({ pname: name, active : true });
  if (!patient) return next(new ErrorHandler("Incorrect patient name", 404));
  return res.status(200).json({ success: true, patient: patient });
});

const createPatient = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber,
    gender, guardian_name, guardian_phoneNo
  } = req.body;

  if (!name || !phoneNumber || !guardian_name || !guardian_phoneNo)
    return next(new ErrorHandler("Insufficient input", 404));

  const password = "password";

  const reqData = {
    pname: name,
    paddr: addr,
    p_phoneNumber: phoneNumber,
    password: password,
    gender,
    guardian_name,
    guardian_phoneNo
  };

  await Patient.create(reqData);
  return res.status(200).json({ success: true, message: "Patient created" });
});

const updatePatient = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const updateFields = req.body;

  const fieldMap = {
    name: 'pname',
    addr: 'paddr',
    phoneNumber: 'p_phoneNumber'
  };

  const patient = await Patient.findById(id);
  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  Object.keys(updateFields).forEach(key => {
    const mappedKey = fieldMap[key] || key;
    if (updateFields[key] !== null && updateFields[key] !== undefined) {
      patient[mappedKey] = updateFields[key];
    }
  });

  await patient.save();
  return res.status(200).json({ message: 'Patient updated successfully', patient });
});

const deletePatient = tryCatch(async(req, res, next) => {
  const { id } = req.body;
  const patient = await Patient.findById(id);
  if(!patient) return next(new ErrorHandler("Patient not found",404));
  patient.active = false;
  await patient.save();
  return res.status(200).json({message : 'Patient deleted successfully'});
});

export { getAllPatient, getThisPatient, createPatient, updatePatient, deletePatient }