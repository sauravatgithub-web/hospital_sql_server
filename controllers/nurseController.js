import Nurse from '../models/nurseModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllNurse = tryCatch(async (req, res) => {
    const allNurses = await Nurse.find({ active: true });
    return res.status(200).json({ success: true, data: allNurses });
});

const getThisNurse = tryCatch(async (req, res, next) => {
    const id = req.params.id;
    const nurse = await Nurse.findOne({ _id: id, active: true });
    if (!nurse) return next(new ErrorHandler("Invalid ID", 404));
    return res.status(200).json({ success: true, nusre: nurse });
});

const createNurse = tryCatch(async (req, res, next) => {
    const { name, addr, phoneNumber, email, gender, shift, qualification } = req.body
    if (!name || !addr || !phoneNumber || !email || !shift || !gender)
        return next(new ErrorHandler("Insufficient input", 404));

    const password = "password";
    const reqData = { ...req.body, password: password };
    await Nurse.create(reqData);
    return res.status(200).json({ success: true });
});

const updateNurse = tryCatch(async (req, res, next) => {
    const { id, ...updateFields } = req.body;

    const updatedNurse = await Nurse.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
    );

    if(!updatedNurse) return next(new ErrorHandler("Nurse not found", 404));
    return res.status(200).json({ success: true, message: 'Nurse updated successfully', nurse: updatedNurse });
});


const deleteNurse = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    const nurse = await Nurse.findById(id);
    if (!nurse) return next(new ErrorHandler("Nurse not found", 404));
    nurse.active = false;
    await nurse.save();
    return res.status(200).json({ message: 'Nurse deleted successfully' });
});

export { 
    getAllNurse, 
    getThisNurse, 
    createNurse, 
    updateNurse, 
    deleteNurse 
}