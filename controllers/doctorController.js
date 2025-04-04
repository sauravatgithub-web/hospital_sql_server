import Doctor from '../models/doctorModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createDoctor = tryCatch(async(req,res,next) => {
    const  {
        name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room, password
    } = req.body

    if(!name || !addr || !phoneNumber || !email || !spec || !inTime || !outTime || !password) 
        return next(new ErrorHandler("Insufficient input",404));

    const reqData = {
        d_name : name, 
        daddr : addr, dspec : spec, 
        inTime, outTime, phoneNumber, 
        d_email : email, 
        gender, qualification, room, password
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


export { createDoctor, updateDoctor }