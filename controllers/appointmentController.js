import Appointment from '../models/appointmentModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllAppointment = tryCatch(async(req, res) => {
    const allAppointment = await Appointment.find({active : true});
    return res.status(200).json({ success: true, data: allAppointment });
});

const getThisAppointment = tryCatch(async(req, res, next) => {
    const id = req.params.id;
    const appointment = await Appointment.find({id, active : true});
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

const deleteAppointment = tryCatch(async(req, res, next) => {
    const { id } = req.body;
    const appointment = await Appointment.findById(id);
    if(!appointment) return next(new ErrorHandler("Appointment not found",404));
    appointment.active = false;
    await appointment.save();
    return res.status(200).json({message : 'Appointment deleted successfully'});
});

const getCurrentAppointments = tryCatch(async (req, res, next) => {
    const { entity, _id } = req.query;

    const appointmentData = await Appointment.find({ [entity]: _id, status: "InProgress" })
        .select('assignedRoom patient disease doctor nurse hps')
        .populate([
            { path: 'patient',      select: 'pname page gender guardian_name guardian_phoneNo' },
            { path: 'disease',      select: 'disname' },
            { path: 'doctor',       select: 'd_name phoneNumber' },
            { path: 'nurse'  ,      select: 'n_name shift n_phoneNumber'},
            { path: 'hps'    ,      select: 'h_name h_phoneNumber'},
            { path: 'assignedRoom', select: 'name'}
        ]);
    if(!appointmentData) return next(new ErrorHandler("Check for errors", 404));

    const appointments = appointmentData.map(appointment => ({
        _id: appointment._id,
        name: appointment.patient.pname,
        age: appointment.patient.page,
        patient: appointment.patient,
        disease: appointment.disease.map(dis => dis.disname),
        room: appointment.assignedRoom.name,
        doctor: appointment.doctor,
        nurse: appointment.nurse,
        hps: appointment.hps
    }));

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
