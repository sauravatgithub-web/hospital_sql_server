import Hospital_Staff from '../models/hsModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';
import Nurse from '../models/nurseModel.js';

const getAllHospitalStaff = tryCatch(async (req, res) => {
  const allStaff = await Hospital_Staff.find({ active: true });
  return res.status(200).json({ success: true, data: allStaff });
});

const getThisHospitalStaff = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const hs = await Hospital_Staff.find({ name, active: true });
  if (!hs) return next(new ErrorHandler("Incorrect Hospital Staff name", 404));
  return res.status(200).json({ success: true, hs: hs });
});

const createHospitalStaff = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email, gender, department, designation, shift, role
  } = req.body;
  console.log(req.body);

  if (!name || !addr || !phoneNumber || !email || !department || !designation)
    return next(new ErrorHandler("Insufficient input", 404));

  await Hospital_Staff.create({
    name, addr, phoneNumber, email, password: "password", 
    gender, department, designation, shift, role
  });
  return res.status(200).json({ success: true });
});

const updateHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  delete req.body._id;
  console.log(req.body);

  const updatedStaff = await Hospital_Staff.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if(!updatedStaff) return next(new ErrorHandler("Hospital staff not found", 404));
  return res.status(200).json({ success: true, message: 'Hospital staff updated successfully', staff: updatedStaff });
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
  return res.status(200).json({ success: true, data: allDoctors });
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
  return res.status(200).json({ success: true, data: allNurses });
});

const getCurrentAppointments = tryCatch(async (req, res, next) => {
  const appointmentData = await Appointment.find({ status: { $in: ["InProgress", "Scheduled"] } })
    .select('time dischargeTime status room patient disease doctor nurse hps')
    .populate([
      {
        path: 'patient',
        select: 'name gender age phoneNumber gname gPhoneNo appointments addr email userName',
        populate: {
          path: 'appointments', 
          select: 'status time' 
        }
      },
      { path: 'disease', select: 'name' },
      { path: 'doctor', select: 'name phoneNumber' },
      { path: 'nurse', select: 'name shift phoneNumber' },
      { path: 'hps', select: 'name phoneNumber' },
      { path: 'room', select: 'name' }
    ]);
  if (!appointmentData) return next(new ErrorHandler("Check for errors", 404));

  const appointments = appointmentData.map(appointment => ({
    _id: appointment._id,
    status: appointment.status,
    name: appointment.patient.name,
    age: appointment.patient.age,
    patient: appointment.patient,
    disease: appointment.disease.map(dis => dis.name),
    room: appointment.room,
    doctor: appointment.doctor,
    nurse: appointment.nurse,
    hps: appointment.hps,
    time: appointment.time,
    dischargeTime: appointment.dischargeTime
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