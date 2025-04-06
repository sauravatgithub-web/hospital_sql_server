import Doctor from '../models/doctorModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllDoctor = tryCatch(async(req, res) => {
    const allDoctors = await Doctor.find();
    const modifiedDoctors = allDoctors.map(doctor => ({
        _id: doctor._id,
        name: doctor.d_name,
        addr: doctor.daddr,
        spec: doctor.dspec,
        inTime: doctor.inTime,
        outTime: doctor.outTime,
        phoneNumber: doctor.phoneNumber,
        email: doctor.d_email,
        userName: doctor.d_userName,
        gender: doctor.gender,
        qualification: doctor.qualification,
        room: doctor.room,
        DOJ: doctor.DOJ,
    }));    
    return res.status(200).json({ success: true, data: modifiedDoctors });
});

const getThisDoctor = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const doctor = await Doctor.find({d_name : name});
    if(!doctor) return next(new ErrorHandler("Incorrect doctor name", 404));
    return res.status(200).json({ success: true, doctor: doctor });
});

const createDoctor = tryCatch(async(req,res,next) => {
    const  {
        name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room
    } = req.body;

    if(!name || !addr || !phoneNumber || !email || !spec || !inTime || !outTime || !room) 
        return next(new ErrorHandler("Insufficient input", 404));

    const password = "password";

    const reqData = {
        d_name : name, 
        daddr : addr, dspec : spec, 
        inTime, outTime, phoneNumber, 
        d_email : email, 
        gender, qualification,
        password: password, room
    }
    await Doctor.create(reqData);
    return res.status(200).json({ success: true });
});

const updateDoctor = tryCatch(async(req,res,next)=>{
    const { id } = req.params;
    const updateFields = req.body;
    
    const fieldMap = {
        name: 'd_name',
        addr: 'daddr',
        spec: 'dspec',
        email: 'd_email',
        username : 'd_userName'
    };
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
        return next(new ErrorHandler("Doctor not found",404));
    }

    Object.keys(updateFields).forEach(key => {
        const mappedKey = fieldMap[key] || key;
        if (updateFields[key] !== null && updateFields[key] !== undefined) {
            doctor[mappedKey] = updateFields[key];
        }
    });
    
    await doctor.save();
    return res.status(200).json({ message: 'Doctor updated successfully', doctor });
});


export {getAllDoctor,getThisDoctor, createDoctor, updateDoctor }