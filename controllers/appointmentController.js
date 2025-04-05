import Appointment from '../models/appointmentModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllAppointment = tryCatch(async(req, res) => {
    const allAppointment = await Appointment.find();
    return res.status(200).json({ success: true, data: allAppointment });
});

const getThisAppointment = tryCatch(async(req, res, next) => {
    const id = req.params.id;
    const appointment = await Appointment.find({id});
    if(!appointment) return next(new ErrorHandler("Incorrect appointment id", 404));
    return res.status(200).json({ success: true, appointment: appointment });
});

const createAppointment = tryCatch(async (req, res, next) => {
    const { patient, doctor } = req.body;

    if(!patient || !doctor ) return next(new ErrorHandler("Insufficient input",404));

    const appointment = await Appointment.create({
        patient, 
        doctor
    });

    return res.status(201).json({ message: 'Appointment created successfully', appointment });
});

const updateAppointment = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const updateFields = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found",404));
    }

    await Appointment.findByIdAndUpdate(id, updateFields, { new: true });

    return res.status(200).json({ message: 'Appointment updated successfully' });
});

export {getAllAppointment,getThisAppointment, createAppointment, updateAppointment };
