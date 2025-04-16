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
import { ErrorHandler, sendEmail } from '../utils/utility.js';
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

  await sendEmail(doctor.email, "New Joinee", null, 'Doctor', doctor.name);
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

const getAppointments = tryCatch(async (req, res, next) => {
  const { _id } = req.query;
   const currentAppointments = await getAppointmentsQuery(_id);

   if (!currentAppointments || currentAppointments.length === 0) {
      return next(new ErrorHandler("No appointments found", 404));
   }

   const appointments = formatAppointments(currentAppointments);
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