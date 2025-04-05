import Hospital_Professional  from '../models/hpModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllHospitalProfessional = tryCatch(async(req, res) => {
    const allHp = await Hospital_Professional.find();
    return res.status(200).json({ success: true, products: allHp });
});

const getThisHospitalProfessional = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const user = await Hospital_Professional.find({h_name : name});
    if(!user) return next(new ErrorHandler("Incorrect user name", 404));
    return res.status(200).json({ success: true, user: user });
});

const createHospitalProfessional = tryCatch(async (req, res, next) => {
    const {
      name, addr, phoneNumber, email, password, gender, uni, degree
    } = req.body;
  
    if (!name || !addr || !phoneNumber || !email || !password || !uni || !degree)
      return next(new ErrorHandler("Insufficient input", 404));
  
    const reqData = {
      h_name: name,
      haddr: addr,
      h_phoneNumber: phoneNumber,
      h_email: email,
      password,
      gender,
      uni,
      degree
    };
  
    await Hospital_Professional.create(reqData);
    return res.status(200).json({ success: true });
  });
  

const updateHospitalProfessional = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const updateFields = req.body;
  
    const updatedHP = await Hospital_Professional.findByIdAndUpdate(id, updateFields, { new: true });
  
    if (!updatedHP) {
        return next(new ErrorHandler("Hospital Professional not found",404));
    }
  
    return res.status(200).json({ message: 'Hospital Professional updated successfully', hospitalProfessional: updatedHP });
  });

export {getAllHospitalProfessional, getThisHospitalProfessional, createHospitalProfessional, updateHospitalProfessional }
  