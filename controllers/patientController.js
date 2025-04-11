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
    age: patient.page,
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

const getPatientByNumber = tryCatch(async (req, res, next) => {
  const number = req.params.phoneNo;
  const patientData = await Patient.findOne({ p_phoneNumber: number }).populate({
    path: 'appointments',
    select: '_id time dischargeTime status'
  });
  if(!patientData) return next(new ErrorHandler("No match found", 404));

  const patient = {
    _id: patientData._id,
    name: patientData.pname,
    addr: patientData.paddr,
    phoneNumber: patientData.p_phoneNumber,
    email: patientData.p_email,
    appointments: patientData.appointments,
    gender: patientData.gender,
    age: patientData.page,
    userName: patientData.p_userName,
    gname: patientData.guardian_name,
    gPhoneNumber: patientData.guardian_phoneNo
  }
  return res.status(200).json({ success: true, patient: patient });
})

const createPatient = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email,
    gender, guardian_name, guardian_phoneNo, age, role
  } = req.body;

  if (!name || !phoneNumber || !guardian_name || !guardian_phoneNo || !email)
    return next(new ErrorHandler("Insufficient input", 404));

  const password = "password";

  const reqData = {
    pname: name,
    paddr: addr,
    p_phoneNumber: phoneNumber,
    password: password,
    p_email: email,
    page: age,
    gender,
    guardian_name,
    guardian_phoneNo
  };

  await Patient.create(reqData);

  if(role === "FDO") {
    const patient = await Patient.findOne({ p_email: email }).populate({
      path: 'appointments',
      select: '_id time dischargeTime status'
    });
    const modifiedPatient = {
      _id: patient._id,
      name: patient.pname,
      addr: patient.paddr,
      phoneNumber: patient.p_phoneNumber,
      email: patient.p_email,
      appointments: patient.appointments,
      gender: patient.gender,
      age: patient.page,
      userName: patient.p_userName,
      gname: patient.guardian_name,
      gPhoneNumber: patient.guardian_phoneNo
    }
    return res.status(200).json({ success: true, message: "Patient created", patient: modifiedPatient });
  }
  
  return res.status(200).json({ success: true, message: "Patient created" });
});

const updatePatient = tryCatch(async (req, res, next) => {
  const { id, role } = req.body;
  const updateFields = req.body;

  const fieldMap = {
    name: 'pname',
    addr: 'paddr',
    phoneNumber: 'p_phoneNumber',
    age: 'page'
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

  if(role === "FDO") {
    const patient = await Patient.findById(id).populate({
      path: 'appointments',
      select: '_id time dischargeTime status'
    });
    const modifiedPatient = {
      _id: patient._id,
      name: patient.pname,
      addr: patient.paddr,
      phoneNumber: patient.p_phoneNumber,
      email: patient.p_email,
      appointments: patient.appointments,
      gender: patient.gender,
      age: patient.page,
      userName: patient.p_userName,
      gname: patient.guardian_name,
      gPhoneNumber: patient.guardian_phoneNo
    }
    return res.status(200).json({ success: true, message: "Patient updated", patient: modifiedPatient });
  }

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

export { getAllPatient, getThisPatient, getPatientByNumber, createPatient, updatePatient, deletePatient }