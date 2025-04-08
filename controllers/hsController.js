import Hospital_Staff from '../models/hsModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllHospitalStaff = tryCatch(async (req, res) => {
  const allStaff = await Hospital_Staff.find({active : true});
  const modifiedStaff = allStaff.map(staff => ({
    _id: staff.id,
    name: staff.s_name,
    addr: staff.s_addr,
    phoneNumber: staff.s_phoneNumber,
    email: staff.s_email,
    userName: staff.s_userName,
    gender: staff.gender,
    department: staff.department,
    designation: staff.designation,
    shift: staff.shift,
    role: staff.role,
    appointments: staff.appointments
  }));
  return res.status(200).json({ success: true, hospitalStaff: modifiedStaff });
});


const getThisHospitalStaff = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const hs = await Hospital_Staff.find({ s_name: name, active : true });
  if (!hs) return next(new ErrorHandler("Incorrect Hospital Staff name", 404));
  return res.status(200).json({ success: true, hs: hs });
});

const createHospitalStaff = tryCatch(async (req, res, next) => {
  const {
    name, addr, phoneNumber, email, password, gender, department, designation, shift, role
  } = req.body;

  if (!name || !addr || !phoneNumber || !email || !password || !department || !designation)
    return next(new ErrorHandler("Insufficient input", 404));

  const reqData = {
    s_name: name,
    s_addr: addr,
    s_phoneNumber: phoneNumber,
    s_email: email,
    password,
    gender,
    department,
    designation,
    shift,
    role
  };

  await Hospital_Staff.create(reqData);
  return res.status(200).json({ success: true });
});

const updateHospitalStaff = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const fieldMap = {
    name: 's_name',
    addr: 's_addr',
    phoneNumber: 's_phoneNumber',
    email: 's_email'
  };

  const staff = await Hospital_Staff.findById(id);
  if (!staff) {
    return next(new ErrorHandler("Hospital staff not found", 404));
  }

  Object.keys(updateFields).forEach(key => {
    const mappedKey = fieldMap[key] || key;
    if (updateFields[key] !== null && updateFields[key] !== undefined) {
      staff[mappedKey] = updateFields[key];
    }
  });

  await staff.save();
  return res.status(200).json({ message: 'Hospital staff updated successfully', staff });
});

const deleteHospitalStaff = tryCatch(async(req, res, next) => {
  const { name } = req.params;
  const hs = await Hospital_Staff.find({ name });
  if(!hs) return next(new ErrorHandler("Hospital staff not found",404));
  hs.active = false;
  await hs.save();
  return res.status(200).json({message : 'Hospital staff deleted successfully'});
});

export { getAllHospitalStaff, getThisHospitalStaff, createHospitalStaff, updateHospitalStaff, deleteHospitalStaff }