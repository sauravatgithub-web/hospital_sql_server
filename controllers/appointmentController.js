import Appointment from '../models/appointmentModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllAppointment = tryCatch(async (req, res) => {
    const allAppointment = await Appointment.find({ active: true });
    return res.status(200).json({ success: true, data: allAppointment });
});

const getThisAppointment = tryCatch(async (req, res, next) => {
    const id = req.params.id;

    const appointment = await Appointment.findOne({ _id: id, active: true })
        .populate([
            { path: 'patient' },
            { path: 'doctor', select: 'name spec phoneNumber room role' },
            { path: 'nurse', select: 'name shift phoneNumber role' },
            { path: 'tests' },
            { path: 'hps', select: 'name phoneNumber' },
            { path: 'disease', select: 'name' },
            { path: 'room', select: 'name bed' },
            { path: 'drugs', select: 'drug name' },
            { path: 'drugs.drug'}
        ]);

    if(!appointment) return next(new ErrorHandler("Incorrect appointment id", 404));
    return res.status(200).json({ success: true, appointment: apptObj });
});


const createAppointment = tryCatch(async (req, res, next) => {
    const { patient, doctor } = req.body;
    if (!patient || !doctor) return next(new ErrorHandler("Insufficient input", 404));

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
    if(!appointment) return next(new ErrorHandler("Appointment not found", 404));

    await Appointment.findByIdAndUpdate(id, updateFields, { new: true });
    return res.status(200).json({ message: 'Appointment updated successfully' });
});

const deleteAppointment = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    const appointment = await Appointment.findById(id);
    if (!appointment) return next(new ErrorHandler("Appointment not found", 404));
    appointment.active = false;
    await appointment.save();
    return res.status(200).json({ message: 'Appointment deleted successfully' });
});

const getCurrentAppointments = tryCatch(async (req, res, next) => {
    const { entity, _id } = req.query;

    const appointments = await Appointment.find({ [entity]: _id, status: "InProgress" })
        .select('room patient disease doctor nurse hps')
        .populate([
            { path: 'patient', select: 'name age gender gname gPhoneNo' },
            { path: 'disease', select: 'name' },
            { path: 'doctor', select: 'name phoneNumber' },
            { path: 'nurse', select: 'name shift phoneNumber' },
            { path: 'hps', select: 'name phoneNumber' },
            { path: 'room', select: 'name' }
        ]);
    if (!appointments) return next(new ErrorHandler("Check for errors", 404));

    return res.status(200).json({ success: true, appointments });
});

export {
    getAllAppointment,
    getThisAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getCurrentAppointments
};
