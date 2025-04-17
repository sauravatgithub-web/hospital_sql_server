import {
  getAllDoctorsQuery,
  getDoctorByIdQuery,
  createDoctorQuery,
  updateDoctorQuery,
  deleteDoctorQuery,
  getAppointmentsQuery
} from '../queries/doctorQuery.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler, sendEmail } from '../utils/utility.js';
import client from '../db.js';
import { formatAppointments2 } from '../lib/formatter.js';


const getAllDoctor = tryCatch(async (req, res) => {
  const result = await getAllDoctorsQuery();
  return res.status(200).json({ success: true, data: result });
});

const getThisDoctor = tryCatch(async (req, res, next) => {
  const id = req.params.id;
  const result = await getDoctorByIdQuery(id);
  if (!result) return next(new ErrorHandler("Invalid id", 404));
  return res.status(200).json({ success: true, doctor: result });
});

const createDoctor = tryCatch(async (req, res, next) => {
  const doctorData = { ...req.body, password: 'password' };

  const room = await client.query(`SELECT * FROM Room WHERE _id = $1 AND active = TRUE`, [doctorData.room]);
  if (room.rowCount === 0 || room.rows[0].vacancy <= 0) {
    return next(new ErrorHandler("Room is full or does not exist", 400));
  }

  const doctor = await createDoctorQuery(doctorData);
  await client.query(`UPDATE Room SET vacancy = vacancy - 1 WHERE _id = $1`, [doctorData.room]);

  await sendEmail(doctor.email, "New Joinee", null, 'Doctor', doctor.name);
  return res.status(200).json({ success: true, doctor: doctor });
});

const updateDoctor = tryCatch(async (req, res, next) => {
  const { id, name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room } = req.body;
  const updates = { name, addr, spec, "inTime": inTime, "outTime": outTime, "phoneNumber": phoneNumber, email, gender, qualification};
  const result = await updateDoctorQuery(id, updates, room);
  if (result.rowCount === 0) return next(new ErrorHandler("Doctor not found", 404));
  return res.status(200).json({ message: 'Doctor updated successfully', doctor: result.rows[0] });
});

const deleteDoctor = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteDoctorQuery(id);
  if (result.rowCount === 0) return next(new ErrorHandler("Doctor not found", 404));
  return res.status(200).json({ message: 'Doctor deleted successfully' });
});

const getAppointments = tryCatch(async (req, res, next) => {
  const { _id } = req.query;
  const currentAppointments = await getAppointmentsQuery(_id);

  const appointments = formatAppointments2(currentAppointments);
  return res.status(200).json({ success: true, appointments });
});

export {
  getAllDoctor,
  getThisDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments
}