import {
  getAllHospitalStaffQuery , 
  getThisHospitalStaffQuery , 
  createHospitalStaffQuery, 
  updateHospitalStaffQuery, 
  deleteHospitalStaffQuery,
  getAllCurrentDoctorsQuery,
  getAllCurrentNursesQuery,
  getAllCurrentAppointmentsQuery
}from '../queries/hsQuery.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import _ from 'lodash';
import bcrypt from 'bcrypt'

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


const getAllCurrentDoctors = tryCatch(async (req, res) => {
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

const getAllCurrentNurses = tryCatch(async (req, res) => {
  const now = new Date();
  const hour = now.getHours();

  let currentShift = '';

  if (hour >= 6 && hour < 12) currentShift = 'Morning';
  else if (hour >= 12 && hour < 18) currentShift = 'Afternoon';
  else if (hour >= 18 && hour < 24) currentShift = 'Evening';
  else currentShift = 'Night';

  try {
    // Get the query from the sqlQueries file and pass the shift value
    const query = getAllCurrentNursesQuery(currentShift);
    
    // Execute the query using the pg client
    const result = await client.query(query);
    const { rows } = result;

    // Group by nurse_id
    const grouped = _.groupBy(rows, 'nurse_id');

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

    // Return the formatted response
    return res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    return next(err);
  }
});

const getCurrentAppointments = tryCatch(async (req, res, next) => {
  // Fetch the data using the SQL query
  const { rows } = await getAllCurrentAppointmentsQuery();

  // Grouping the result by nurse_id to organize the data
  const grouped = _.groupBy(rows, 'nurse_id');
  
  // Formatting the result in the desired structure
  const formatted = Object.values(grouped).map(group => {
    const nurse = group[0]; // Nurse data will be the same across the group

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
        status: a.status,
        time: a.time,
        dischargeTime: a.dischargeTime,
        patient: {
          _id: a.patient_id,
          name: a.patient_name,
          age: a.age,
          phoneNumber: a.phoneNumber,
          gname: a.gname,
          gPhoneNo: a.gPhoneNo,
          addr: a.addr,
          email: a.email,
          userName: a.userName
        },
        doctor: {
          _id: a.doctor_id,
          name: a.doctor_name,
          phoneNumber: a.doctor_phoneNumber
        },
        room: {
          _id: a.room_id,
          name: a.room_name,
          bed: a.room_bed
        },
        hps: _.uniqBy(group.filter(r => r.hp_id), 'hp_id').map(h => ({
          _id: h.hp_id,
          name: h.hp_name,
          phoneNumber: h.hp_phoneNumber
        })),
        tests: _.uniqBy(group.filter(r => r.test_id), 'test_id').map(t => ({
          _id: t.test_id,
          name: t.test_name,
          equip: t.test_equip
        }))
      }))
    };
  });

  return res.status(200).json({ success: true, data: formatted });
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