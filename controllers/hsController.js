import Hospital_Staff from '../models/hsModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';
import Nurse from '../models/nurseModel.js';

const getAllHospitalStaff = tryCatch(async (req, res) => {
  const allStaff = await Hospital_Staff.find({ active: true });
  const modifiedStaff = allStaff.map(staff => ({
    _id: staff.id,
    name: staff.s_name,
    addr: staff.s_addr,
    phoneNumber: staff.s_phoneNumber,
    email: staff.s_email,
    userName: staff.s_userName,
    gender: staff.gender,
    department: staff.department,
    designation: staff.designation,
    shift: staff.shift,
    role: staff.role,
    appointments: staff.appointments
  }));
  return res.status(200).json({ success: true, hospitalStaff: modifiedStaff });
});


const getThisHospitalStaff = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const hs = await Hospital_Staff.find({ s_name: name, active: true });
  if (!hs) return next(new ErrorHandler("Incorrect Hospital Staff name", 404));
  return res.status(200).json({ success: true, hs: hs });
});

const createHospitalStaff = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email, password, gender, department, designation, shift, role
  } = req.body;

  if (!name || !addr || !phoneNumber || !email || !password || !department || !designation)
    return next(new ErrorHandler("Insufficient input", 404));

  const reqData = {
    s_name: name,
    s_addr: addr,
    s_phoneNumber: phoneNumber,
    s_email: email,
    password,
    gender,
    department,
    designation,
    shift,
    role
  };

  await Hospital_Staff.create(reqData);
  return res.status(200).json({ success: true });
});

const updateHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const fieldMap = {
    name: 's_name',
    addr: 's_addr',
    phoneNumber: 's_phoneNumber',
    email: 's_email'
  };

  const staff = await Hospital_Staff.findById(id);
  if (!staff) {
    return next(new ErrorHandler("Hospital staff not found", 404));
  }

  Object.keys(updateFields).forEach(key => {
    const mappedKey = fieldMap[key] || key;
    if (updateFields[key] !== null && updateFields[key] !== undefined) {
      staff[mappedKey] = updateFields[key];
    }
  });

  await staff.save();
  return res.status(200).json({ message: 'Hospital staff updated successfully', staff });
});

const deleteHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const hs = await Hospital_Staff.findById(id);
  if (!hs) return next(new ErrorHandler("Hospital staff not found", 404));
  hs.active = false;
  await hs.save();
  return res.status(200).json({ message: 'Hospital staff deleted successfully' });
});

const getAllCurrentDoctors = tryCatch(async (req, res, next) => {
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);
  const allDoctors = await Doctor.find({
    inTime: { $lt: time },
    outTime: { $gt: time }
  });

  const modifiedDoctors = allDoctors.map(doctor => ({
    _id: doctor._id,
    name: doctor.d_name,
    role: doctor.role,
    addr: doctor.daddr,
    spec: doctor.dspec,
    inTime: doctor.inTime,
    outTime: doctor.outTime,
    phoneNumber: doctor.phoneNumber,
    email: doctor.d_email,
    userName: doctor.d_userName,
    gender: doctor.gender,
    qualification: doctor.qualification,
    room: doctor.room,
    DOJ: doctor.DOJ,
  }));

  return res.status(200).json({ success: true, data: modifiedDoctors });
});

const getAllCurrentNurses = tryCatch(async (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();

  let currentShift = '';

  if (hour >= 6 && hour < 12) currentShift = 'Morning';
  else if (hour >= 12 && hour < 18) currentShift = 'Afternoon';
  else if (hour >= 18 && hour < 24) currentShift = 'Evening';
  else currentShift = 'Night';

  const allNurses = await Nurse.find({ shift: currentShift });

  const modifiedNurses = allNurses.map(nurse => ({
    _id: nurse._id,
    name: nurse.n_name,
    role: nurse.role,
    addr: nurse.n_addr,
    phoneNumber: nurse.n_phoneNumber,
    email: nurse.n_email,
    userName: nurse.n_userName,
    gender: nurse.gender,
    shift: nurse.shift,
    qualification: nurse.qualification
  }));

  return res.status(200).json({ success: true, data: modifiedNurses });
});

const getCurrentAppointments = tryCatch(async (req, res, next) => {
  const appointmentData = await Appointment.find({ status: { $in: ["InProgress", "Scheduled"] } })
    .select('time dischargeTime status assignedRoom patient disease doctor nurse hps')
    .populate([
      { path: 'patient', select: 'pname page gender guardian_name guardian_phoneNo' },
      { path: 'disease', select: 'disname' },
      { path: 'doctor', select: 'd_name phoneNumber' },
      { path: 'nurse', select: 'n_name shift n_phoneNumber' },
      { path: 'hps', select: 'h_name h_phoneNumber' },
      { path: 'assignedRoom', select: 'name' }
    ]);
  if (!appointmentData) return next(new ErrorHandler("Check for errors", 404));

  const appointments = appointmentData.map(appointment => ({
    _id: appointment._id,
    status: appointment.status,
    name: appointment.patient.pname,
    age: appointment.patient.page,
    patient: appointment.patient,
    disease: appointment.disease.map(dis => dis.disname),
    room: appointment.assignedRoom.name,
    doctor: appointment.doctor,
    nurse: appointment.nurse,
    hps: appointment.hps
  }));

  return res.status(200).json({ success: true, appointments });
});

export {
  getAllHospitalStaff,
  getThisHospitalStaff,
  createHospitalStaff,
  updateHospitalStaff,
  deleteHospitalStaff,
  getAllCurrentDoctors,
  getAllCurrentNurses,
  getCurrentAppointments
}