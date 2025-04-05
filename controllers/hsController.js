import Hospital_Staff  from '../models/hsModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllHospitalStaff = tryCatch(async(req, res) => {
    const allHospitalStaff = await Hospital_Staff.find();
    return res.status(200).json({ success: true, data: allHospitalStaff });
});

const getThisHospitalStaff = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const hs = await Hospital_Staff.find({s_name : name});
    if(!hs) return next(new ErrorHandler("Incorrect Hospital Staff name", 404));
    return res.status(200).json({ success: true, hs : hs });
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

export {getAllHospitalStaff, getThisHospitalStaff, createHospitalStaff , updateHospitalStaff }