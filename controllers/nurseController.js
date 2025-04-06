import Nurse from '../models/nurseModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllNurse = tryCatch(async(req, res) => {
    const allNurses = await Nurse.find();
    const modifiedNurses = allNurses.map(nurse => ({
        _id: nurse._id,
        name: nurse.n_name,
        addr: nurse.n_addr,
        phoneNumber: nurse.n_phoneNumber,
        email: nurse.n_email,
        userName: nurse.n_userName,
        gender: nurse.gender,
        shift: nurse.shift,
        qualification: nurse.qualification
    }));   
    return res.status(200).json({ success: true, data: modifiedNurses });
});

const getThisNurse = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const nurse = await Nurse.find({n_name : name});
    if(!nurse) return next(new ErrorHandler("Incorrect nurse name", 404));
    return res.status(200).json({ success: true, nusre : nurse });
});

const createNurse = tryCatch(async(req,res,next) => {
    const  {
        name, addr, phoneNumber, email, gender, shift, qualification
    } = req.body

    if(!name || !addr || !phoneNumber || !email || !shift || !gender) 
        return next(new ErrorHandler("Insufficient input",404));

    const password = "password";

    const reqData = {
        n_name : name, 
        n_addr : addr,
        n_phoneNumber : phoneNumber, 
        n_email : email, 
        gender, password: password, shift, qualification
    }
    await Nurse.create(reqData);
    return res.status(200).json({ success: true });
});

const updateNurse = tryCatch(async(req, res, next) => {
    const { id } = req.body;
    const updateFields = req.body;
    
    const fieldMap = {
        name: 'n_name',
        addr: 'n_addr',
        email: 'n_email',
        username : 'n_userName',
        phoneNumber: 'n_phoneNumber'
    };
    
    const nurse = await Nurse.findById(id);
    if (!nurse) {
        return next(new ErrorHandler("Nurse not found",404));
    }

    Object.keys(updateFields).forEach(key => {
        const mappedKey = fieldMap[key] || key;
        if (updateFields[key] !== null && updateFields[key] !== undefined) {
            nurse[mappedKey] = updateFields[key];
        }
    });
    
    await nurse.save();
    return res.status(200).json({ message: 'Nurse updated successfully', nurse });
});


export { getAllNurse, getThisNurse, createNurse, updateNurse }