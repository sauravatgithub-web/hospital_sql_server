import {
  getAllHospitalStaffQuery,
  getThisHospitalStaffQuery,
  createHospitalStaffQuery,
  updateHospitalStaffQuery,
  deleteHospitalStaffQuery,
  getAllCurrentDoctorsQuery,
  getAllCurrentNursesQuery,
  getAllCurrentAppointmentsQuery
} from '../queries/hsQuery.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import client from "../db.js";

const getAllHospitalStaff = tryCatch(async (req, res) => {
  const result = await getAllHospitalStaffQuery();
  return res.status(200).json({ success: true, data: result.rows });
});


const getThisHospitalStaff = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const result = await getThisHospitalStaffQuery(name);
  if (result.rows.length === 0) {
    return next(new ErrorHandler("Incorrect drug name", 404));
  }
  return res.status(200).json({ success: true, drug: result.rows[0] });
});

const createHospitalStaff = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email, gender,
    department, designation, shift, role
  } = req.body;
  console.log(req.body);

  if (!name || !addr || !phoneNumber || !email || !department || !designation || !shift || !role)
    return next(new ErrorHandler("Insufficient input", 404));

  const hashedPassword = await bcrypt.hash('password', 10);
  const result = await createHospitalStaffQuery({
    // name, addr, phoneNumber, email, gender,
    // department, designation, shift, role,
    ...req.body,
    password: hashedPassword
  });

  return res.status(200).json({ success: true, staff: result.rows[0] });
});


const updateHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  console.log(req.body);
  if (!id)
    return next(new ErrorHandler("Staff ID is required", 400));

  const result = await updateHospitalStaffQuery(id, req.body);

  if (result.rowCount === 0)
    return next(new ErrorHandler("Staff not found", 404));

  return res.status(200).json({
    success: true,
    message: "Staff updated successfully",
    staff: result.rows[0]
  });
});

const deleteHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteHospitalStaffQuery(id);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Drug not found", 404));
  }
  return res.status(200).json({ message: 'Drug deleted successfully' });
});


const getAllCurrentDoctors = tryCatch(async (req, res, next) => {
  const { rows } = await getAllCurrentDoctorsQuery();

  const grouped = _.groupBy(rows, 'doctor_id');
  const formatted = Object.values(grouped).map(group => {
    const doc = group[0];

    return {
      _id: doc.doctor_id,
      name: doc.doctor_name,
      addr: doc.addr,
      email: doc.email,
      gender: doc.gender,
      role: doc.role,
      spec: doc.spec,
      qualification: doc.qualification,
      userName: doc.userName,
      phoneNumber: doc.phoneNumber,
      DOJ: doc.DOJ,
      inTime: doc.inTime,
      outTime: doc.outTime,
      room: doc.room_id ? {
        _id: doc.room_id,
        name: doc.room_name
      } : null,
      appointments: _.uniqBy(group.filter(r => r.appointment_id), 'appointment_id').map(a => ({
        _id: a.appointment_id,
        aTime: a.aTime,
        dischargeTime: a.dischargeTime,
        status: a.status
      })),
      hps: _.uniqBy(group.filter(r => r.hp_id), 'hp_id').map(h => ({
        _id: h.hp_id,
        name: h.hp_name
      })),
      tests: _.uniqBy(group.filter(r => r.test_id), 'test_id').map(t => ({
        _id: t.test_id,
        name: t.test_name,
        equip: t.test_equip
      }))
    };
  });

  return res.status(200).json({ success: true, data: formatted });
});



const getAllCurrentNurses = tryCatch(async (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();

  let currentShift = '';

  if (hour >= 6 && hour < 12) currentShift = 'Morning';
  else if (hour >= 12 && hour < 18) currentShift = 'Afternoon';
  else if (hour >= 18 && hour < 24) currentShift = 'Evening';
  else currentShift = 'Night';

  // Get the query from the sqlQueries file and pass the shift value
  // Execute the query using the pg client
  const result = await getAllCurrentNursesQuery(currentShift);
  const { rows } = result;

  // Group by nurse_id
  const grouped = _.groupBy(rows, 'nurse_id');
  console.log(grouped);

  // Format the data as needed
  const formatted = Object.values(grouped).map(group => {
    const nurse = group[0]; // The first row represents the nurse data

    return {
      _id: nurse.nurse_id,
      name: nurse.nurse_name,
      addr: nurse.addr,
      email: nurse.email,
      gender: nurse.gender,
      role: nurse.role,
      shift: nurse.shift,
      userName: nurse.userName,
      phoneNumber: nurse.phoneNumber,
      appointments: _.uniqBy(group.filter(r => r.appointment_id), 'appointment_id').map(a => ({
        _id: a.appointment_id,
        aTime: a.aTime,
        dischargeTime: a.dischargeTime,
        status: a.status
      })),
      tests: _.uniqBy(group.filter(r => r.test_id), 'test_id').map(t => ({
        _id: t.test_id,
        name: t.test_name,
        equip: t.test_equip,
        room: t.room_id ? {
          _id: t.room_id,
          name: t.room_name
        } : null
      }))
    };
  });
  console.log(formatted);

  // Return the formatted response
  return res.status(200).json({ success: true, data: formatted });
});

const formatAppointments = (rows) => {
  const appointmentsMap = new Map();

  for (const row of rows) {
    const aid = row.appointment_id;

    if (!appointmentsMap.has(aid)) {
      appointmentsMap.set(aid, {
        _id: aid,
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


const getCurrentAppointments = tryCatch(async (req, res, next) => {
  const rows = await getAllCurrentAppointmentsQuery();
  if (!rows || rows.length === 0) {
    return next(new ErrorHandler('Incorrect appointment id', 404));
  }

  const appointment = formatAppointments(rows);
  return res.status(200).json({ success: true, appointment });
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