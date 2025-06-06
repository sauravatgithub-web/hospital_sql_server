import {
  getAllPatientQuery,
  getThisPatientQuery,
  getPatientByNumberQuery,
  createPatientQuery,
  updatePatientQuery,
  getPatientByEmailQueryWithAppointments,
  getPatientByIdQueryWithAppointments,
  deletePatientQuery
} from '../queries/patientQuery.js';
import { tryCatch } from '../middlewares/error.js';
import { getPatientAppointmentsQuery } from '../queries/appointmentQuery.js'
import { ErrorHandler, sendEmail } from '../utils/utility.js';

const getAllPatient = tryCatch(async (req, res) => {
  const result = await getAllPatientQuery();
  return res.status(200).json({ success: true, data: result.rows });
});


const getThisPatient = tryCatch(async (req, res, next) => {
  const id = req.params.id;
  const result = await getThisPatientQuery(id);
  if (result.rows.length === 0) return next(new ErrorHandler("Incorrect patient ID", 404));

  const patient = { ...result.rows[0] };
  delete patient.appointment_id;

  const appointmentIDs = result.rows.map(row => row.appointment_id);
  const appointments = await getPatientAppointmentsQuery(appointmentIDs);
  patient.appointments = appointments;

  return res.status(200).json({ success: true, patient });
});

const getPatientByNumber = tryCatch(async (req, res, next) => {
  const number = req.params.phoneNo;
  const result = await getPatientByNumberQuery(number);
  if (result.rows.length === 0) return next(new ErrorHandler("No match found", 404));

  const patient = { ...result.rows[0] };
  delete patient.appointment_id;

  const appointmentIDs = result.rows.map(row => row.appointment_id);
  const appointments = await getPatientAppointmentsQuery(appointmentIDs);
  patient.appointments = appointments;

  return res.status(200).json({ success: true, patient });
});

const createPatient = tryCatch(async (req, res, next) => {
  const { name, addr, phoneNumber, email, gender, gname, gPhoneNo, age, role } = req.body;
  if (!name || !phoneNumber || !gname || !gPhoneNo || !email)
    return next(new ErrorHandler("Insufficient input", 404));

  await createPatientQuery(name, addr, phoneNumber, email, gender, gname, gPhoneNo, age);

  if (role === "FDO") {
    const result = await getPatientByEmailQueryWithAppointments(email);
    const patient = {
      ...result.rows[0],
      appointments: result.rows
        .filter(r => r.appointment_id)
        .map(r => ({
          _id: r.appointment_id,
          time: r.time,
          dischargeTime: r.dischargetime,
          status: r.status
        }))
    };
    await sendEmail(email, "New Patient", null, 'Patient', name);
    return res.status(200).json({ success: true, message: "Patient created", patient });
  }

  await sendEmail(email, "New Patient", null, 'Patient', name);
  return res.status(200).json({ success: true, message: "Patient created" });
});

const updatePatient = tryCatch(async (req, res, next) => {
  const { id, role, ...fields } = req.body;
  const updated = await updatePatientQuery(id, fields);

  if (!updated) return next(new ErrorHandler("Patient not found", 404));

  if (role === "FDO") {
    const result = await getPatientByIdQueryWithAppointments(id);
    const patient = {
      ...result.rows[0],
      appointments: result.rows
        .filter(r => r.appointment_id)
        .map(r => ({
          _id: r.appointment_id,
          time: r.atime,
          dischargeTime: r.dischargetime,
          status: r.status
        }))
    };
    return res.status(200).json({ success: true, message: "Patient updated", patient });
  }

  return res.status(200).json({ success: true, message: 'Patient updated successfully' });
});

const deletePatient = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deletePatientQuery(id);
  if (result.rows.length === 0) return next(new ErrorHandler("Patient not found", 404));

  return res.status(200).json({ message: 'Patient deleted successfully' });
});

export { 
  getAllPatient, 
  getThisPatient, 
  getPatientByNumber, 
  createPatient, 
  updatePatient, 
  deletePatient 
}