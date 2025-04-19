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
import { ErrorHandler, sendEmail} from '../utils/utility.js';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import { formatAppointments3 } from '../lib/formatter.js';

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

  if (!name || !addr || !phoneNumber || !email || !department || !designation || !shift || !role)
    return next(new ErrorHandler("Insufficient input", 404));

  const hashedPassword = await bcrypt.hash('password', 10);
  const result = await createHospitalStaffQuery({
    ...req.body,
    password: hashedPassword
  });

  await sendEmail(email, "New Joinee", null, designation, name);
  return res.status(200).json({ success: true, staff: result.rows[0] });
});


const updateHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.body;
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

  const result = await getAllCurrentNursesQuery(currentShift);
  const { rows } = result;

  const grouped = _.groupBy(rows, 'nurse_id');

  const formatted = Object.values(grouped).map(group => {
    const nurse = group[0]; 

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

  return res.status(200).json({ success: true, data: formatted });
});

const getCurrentAppointments = tryCatch(async (req, res, next) => {
  const rows = await getAllCurrentAppointmentsQuery();
  if (!rows || rows.length === 0) {
    return next(new ErrorHandler('Incorrect appointment id', 404));
  }

  const appointments = formatAppointments3(rows);
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