import {
  getAllDoctorsQuery,
  getDoctorByIdQuery,
  createDoctorQuery,
  updateDoctorQuery,
  deleteDoctorQuery,
  getDocAppointment,
  getAppointmentsQuery
} from '../queries/doctorQuery.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import client from '../db.js';


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

  return res.status(200).json({ success: true, doctor: doctor });
});

const updateDoctor = tryCatch(async (req, res, next) => {
  const { id, name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification } = req.body;
  const updates = { name, addr, spec, "inTime": inTime, "outTime": outTime, "phoneNumber": phoneNumber, email, gender, qualification };
  const result = await updateDoctorQuery(id, updates);
  if (result.rowCount === 0) return next(new ErrorHandler("Doctor not found", 404));
  return res.status(200).json({ message: 'Doctor updated successfully', doctor: result.rows[0] });
});

const deleteDoctor = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteDoctorQuery(id);
  if (result.rowCount === 0) return next(new ErrorHandler("Doctor not found", 404));
  return res.status(200).json({ message: 'Doctor deleted successfully' });
});

const formatAppointment = (rows) => {
  const row = rows[0];

  const appointment = {
    _id: row.appointment_id,
    time: row.time,
    dischargeTime: row.dischargetime,
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
  };

  for (const r of rows) {
    if (r.drug_id && !appointment.drugs.find(d => d.drug && d.drug._id === r.drug_id)) {
      appointment.drugs.push({
        drug: { _id: r.drug_id, name: r.drug_name },
        dosage: r.drug_dosage,
      });
    }

    if (r.disease_id && !appointment.disease.find(d => d._id === r.disease_id)) {
      appointment.disease.push({
        _id: r.disease_id,
        name: r.disease_name,
      });
    }

    if (r.test_id && !appointment.tests.find(t => t.test && t.test._id === r.test_id)) {
      appointment.tests.push({
        test: {
          _id: r.test_id,
          name: r.test_name,
          room: r.test_room_id ? { _id: r.test_room_id, name: r.test_room_name } : undefined,
          doctor: r.test_doctor_id ? { _id: r.test_doctor_id, name: r.test_doctor_name } : undefined
        },
        remark: r.test_remark,
      });
    }

    if (r.nurse_id && !appointment.nurse.find(n => n._id === r.nurse_id)) {
      appointment.nurse.push({
        _id: r.nurse_id,
        name: r.nurse_name,
        phoneNumber: r.nurse_phone,
        shift: r.nurse_shift,
        gender: r.nurse_gender,
      });
    }

    if (r.nurse_id && r.nurse_remark_time && r.nurse_remark_msg) {
      appointment.remarks.push({
        remarkTime: r.nurse_remark_time,
        remarkUser: r.nurse_name,
        remarkUserRole: 'Nurse',
        remarkMsg: r.nurse_remark_msg,
      });
    }

    if (r.doctor_id && r.doctor_remark_time && r.doctor_remark_msg) {
     appointment.remarks.push({
       remarkTime: r.doctor_remark_time,
       remarkUser: r.doctor_name,
       remarkUserRole: 'Doctor',
       remarkMsg: r.doctor_remark_msg,
     });
   }

    if (r.hps_id && !appointment.hps.find(h => h._id === r.hps_id)) {
      appointment.hps.push({
        _id: r.hps_id,
        name: r.hps_name,
        phoneNumber: r.hps_phone,
        gender: r.hps_gender,
      });
    }
  }

  return appointment;
};

const getAppointments = tryCatch(async (req, res, next) => {
  const { id } = req.body;
   const currentAppointments = await getAppointmentsQuery(id);

   if (!currentAppointments || currentAppointments.length === 0) {
      return next(new ErrorHandler("No appointments found", 404));
   }

   const appointments = formatAppointment(currentAppointments);
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