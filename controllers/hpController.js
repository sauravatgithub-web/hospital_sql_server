import Hospital_Professional  from '../models/hpModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllHospitalProfessional = tryCatch(async(req, res) => {
  const allHp = await Hospital_Professional.find();
  modifiedHp = allHp.map(hp=>({
    _id : hp.id,
    name: hp.h_name,
    addr: hp.haddr,
    phoneNumber: hp.h_phoneNumber,
    email: hp.h_email,
    userName: hp.h_userName,
    gender: hp.gender,
    uni: hp.uni,
    degree: hp.degree,
    supervisedBy: hp.supervisedBy,
    appointments: hp.appointments
  }));
  return res.status(200).json({ success: true, products: modifiedHp });
    const allHp = await Hospital_Professional.find();
    console.log(allHp);
    const modifiedHps = allHp.map(hp => ({
      _id: hp._id,
      name: hp.h_name,
      addr: hp.haddr,
      phoneNumber: hp.h_phoneNumber,
      email: hp.h_email,
      userName: hp.h_userName,
      gender: hp.gender,
      uni: hp.uni,
      degree: hp.degree,
      supervisedBy: hp.supervisedBy,
    }))
    return res.status(200).json({ success: true, data: modifiedHps });
});

const getThisHospitalProfessional = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const user = await Hospital_Professional.find({h_name : name});
    if(!user) return next(new ErrorHandler("Incorrect user name", 404));
    return res.status(200).json({ success: true, user: user });
});

const createHospitalProfessional = tryCatch(async (req, res, next) => {
    const {
      name, addr, phoneNumber, email, gender, uni, degree, supervisedBy
    } = req.body;
  
    if (!name || !addr || !phoneNumber || !email || !uni || !degree)
      return next(new ErrorHandler("Insufficient input", 404));

    const password = "password";
  
    const reqData = {
      h_name: name,
      haddr: addr,
      h_phoneNumber: phoneNumber,
      h_email: email,
      password: password,
      gender,
      uni,
      degree,
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
  