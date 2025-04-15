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

// Controller for getting all active appointments
const getAllAppointment = tryCatch(async (req, res) => {
  const allAppointments = await getAllAppointmentsQuery();
  return res.status(200).json({ success: true, data: allAppointments });
});

const formatAppointments = (rows) => {
  const appointmentsMap = new Map();

  for (const row of rows) {
    const aid = row.appointment_id;

    if (!appointmentsMap.has(aid)) {
      appointmentsMap.set(aid, {
        _id: aid,
        name: row.patient_name,
        age: row.patient_age,
        time: row.time,
        dischargeTime: row.dischargeTime,
        status: row.status,
        active: row.active,

        patient: {
          _id: row.patient_id,
          name: row.patient_name,
          addr: row.patient_address,
          age: row.patient_age,
          phoneNumber: row.patient_phone,
          email: row.patient_email,
          userName: row.patient_username,
          gender: row.patient_gender,
          gname: row.patient_guardian_name,
          gPhoneNo: row.patient_guardian_phone,
        },

        doctor: {
          _id: row.doctor_id,
          name: row.doctor_name,
          gender: row.doctor_gender,
          phoneNumber: row.doctor_phone,
          inTime: row.doctor_in_time,
          outTime: row.doctor_out_time,
          spec: row.doctor_specialization,
          room: {
            _id: row.doctor_roomId,
            name: row.doctor_roomName,
          },
        },

        room: {
          _id: row.patient_roomId,
          name: row.patient_roomName,
        },

        bed: {
          _id: row.bed_id,
          name: row.bed_name,
          isOccupied: row.bed_occupied,
        },

        drugs: [],
        disease: [],
        tests: [],
        nurse: [],
        remarks: [],
        hps: [],
      });
    }

    const appointment = appointmentsMap.get(aid);

    if (row.drug_id && !appointment.drugs.find(d => d.drug && d.drug._id === row.drug_id)) {
      appointment.drugs.push({
        drug: { _id: row.drug_id, name: row.drug_name },
        dosage: row.drug_dosage,
      });
    }

    if (row.disease_id && !appointment.disease.find(d => d._id === row.disease_id)) {
      appointment.disease.push({
        _id: row.disease_id,
        name: row.disease_name,
      });
    }

    if (row.test_id && !appointment.tests.find(t => t.test && t.test._id === row.test_id)) {
      appointment.tests.push({
        test: {
          _id: row.test_id,
          name: row.test_name,
          room: row.test_room_id ? { _id: row.test_room_id, name: row.test_room_name } : undefined,
          doctor: row.test_doctor_id ? { _id: row.test_doctor_id, name: row.test_doctor_name } : undefined
        },
        remark: row.test_remark,
      });
    }

    if (row.nurse_id && !appointment.nurse.find(n => n._id === row.nurse_id)) {
      appointment.nurse.push({
        _id: row.nurse_id,
        name: row.nurse_name,
        phoneNumber: row.nurse_phone,
        shift: row.nurse_shift,
        gender: row.nurse_gender,
      });
    }

    if (row.nurse_id && row.nurse_remark_time && row.nurse_remark_msg) {
      appointment.remarks.push({
        remarkTime: row.nurse_remark_time,
        remarkUser: row.nurse_name,
        remarkUserRole: 'Nurse',
        remarkMsg: row.nurse_remark_msg,
      });
    }

    if (row.doctor_id && row.doctor_remark_time && row.doctor_remark_msg) {
      appointment.remarks.push({
        remarkTime: row.doctor_remark_time,
        remarkUser: row.doctor_name,
        remarkUserRole: 'Doctor',
        remarkMsg: row.doctor_remark_msg,
      });
    }

    if (row.hps_id && !appointment.hps.find(h => h._id === row.hps_id)) {
      appointment.hps.push({
        _id: row.hps_id,
        name: row.hps_name,
        phoneNumber: row.hps_phone,
        gender: row.hps_gender,
      });
    }
  }

  return Array.from(appointmentsMap.values());
};


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
  const {
    id, time,
    dischargeTime, status,
    doctorId, patientId,
    nurseIds, testDetails,
    hpsIds, diseaseIds,
    roomId, bedId,
    drugDetails, remarks
  } = req.body;

  if (!id || !doctorId || !patientId) {
    return next(new ErrorHandler("Insufficient input for update", 400));
  }

  await updateAppointmentQuery({
    id, time,
    dischargeTime, status,
    doctorId, patientId,
    nurseIds, testDetails,
    hpsIds, diseaseIds,
    roomId, bedId,
    drugDetails, remarks
  });

  const rows = await getAppointmentByIdQuery(id);
  const appointment = formatAppointment(rows);

  return res.status(200).json({ success: true, appointment });
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

  if (!currentAppointments || currentAppointments.length === 0) {
    return next(new ErrorHandler("No appointments found", 404));
  }

  const appointments = formatAppointments(currentAppointments);
  return res.status(200).json({ success: true, appointments });
});

const dischargeAppointment = tryCatch(async (req, res, next) => {
  const { id, dischargeTime } = req.body;
  if (!id || !dischargeTime) return next(new ErrorHandler("Insufficient Fields", 404));

  const dischargeApp = await dischargeAppointmentQuery(id, dischargeTime);
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
