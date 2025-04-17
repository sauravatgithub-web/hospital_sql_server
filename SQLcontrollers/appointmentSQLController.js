import {
  getAllAppointmentsQuery,
  getAppointmentByIdQuery,
  createAppointmentQuery,
  updateAppointmentQuery,
  deleteAppointmentQuery,
  getCurrentAppointmentsQuery,
  dischargeAppointmentQuery
} from '../queries/appointmentQuery.js';
import { ErrorHandler } from '../utils/utility.js';
import { tryCatch } from '../middlewares/error.js';
import { formatAppointments } from '../lib/formatter.js';

// Controller for getting all active appointments
const getAllAppointment = tryCatch(async (req, res) => {
  const allAppointments = await getAllAppointmentsQuery();
  return res.status(200).json({ success: true, data: allAppointments });
});

// Controller for getting a specific appointment by ID
const getThisAppointment = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const rows = await getAppointmentByIdQuery(id);

  if (!rows || rows.length === 0) {
    return next(new ErrorHandler('Incorrect appointment id', 404));
  }

  const appointment = formatAppointments(rows);
  return res.status(200).json({ success: true, appointment: appointment[0] });
});

// Controller for creating a new appointment
const createAppointment = tryCatch(async (req, res, next) => {
  const { time, patient, doctor, user } = req.body;

  if (!patient || !doctor) {
    return next(new ErrorHandler("Insufficient input", 400));
  }

  const appointment = await createAppointmentQuery(time, patient, doctor, user);
  return res.status(201).json({ message: 'Appointment created successfully', appointment });
});

// Controller for updating an appointment
const updateAppointment = tryCatch(async (req, res, next) => {
  const { tests, drugs } = req.body;

  const id = req.body.id;
  const doctor = req.body?.doctor;
  const nurse = req.body?.nurse;
  const hps = req.body?.hps?.map(h => h._id);
  const disease = req.body?.disease?.map(d => d._id);
  const room = req.body?.room?._id;
  const bed = req.body?.bed;
  const allRemarks = req.body?.remarks
  const remarks = allRemarks ? allRemarks[allRemarks.length - 1] : null;

  if (!id) {
    return next(new ErrorHandler("Insufficient input for update", 400));
  }

  await updateAppointmentQuery({
    id,
    doctor,
    nurse, tests,
    hps, disease,
    room, bed,
    drugs, remarks
  });

  const rows = await getAppointmentByIdQuery(id);
  const appointment = formatAppointments(rows);

  return res.status(200).json({ success: true, appointment: appointment[0] });
});

// Controller for deleting an appointment (mark as inactive)
const deleteAppointment = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const deletedAppointment = await deleteAppointmentQuery(id);

  if (!deletedAppointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }

  return res.status(200).json({ message: 'Appointment deleted successfully' });
});

// Controller for getting current appointments (InProgress)
const getCurrentAppointments = tryCatch(async (req, res, next) => {
  const { entity, _id } = req.query;
  const currentAppointments = await getCurrentAppointmentsQuery(entity, _id);

  const appointments = formatAppointments(currentAppointments);
  return res.status(200).json({ success: true, appointments });
});

const dischargeAppointment = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new ErrorHandler("Insufficient Fields", 404));

  const dischargeApp = await dischargeAppointmentQuery(id);
  if (!dischargeApp) return next(new ErrorHandler("No appointment Found", 404));

  return res.status(200).json({ success: true, dischargeApp });
});

export {
  getAllAppointment,
  getThisAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getCurrentAppointments,
  dischargeAppointment
};