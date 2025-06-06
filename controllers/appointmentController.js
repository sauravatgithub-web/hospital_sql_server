import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';
import Patient from '../models/patientModel.js';
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
            { path: 'hps', select: 'name phoneNumber' },
            { path: 'disease', select: 'name' },
            { path: 'room', select: 'name bed' },
            { path: 'drugs', select: 'drug name' },
            { path: 'drugs.drug' },
            {
                path: 'tests', select: 'test remark',
                populate: {
                    path: 'test',
                    select: 'name doctor nurse room'
                }
            },
        ]);

    if (!appointment) return next(new ErrorHandler("Incorrect appointment id", 404));
    return res.status(200).json({ success: true, appointment });
});


const createAppointment = tryCatch(async (req, res, next) => {
    const { time, patient, doctor } = req.body;
    if (!patient || !doctor) return next(new ErrorHandler("Insufficient input", 404));

    const appointment = await Appointment.create({ time, patient, doctor });
    const doctorData = await Doctor.findById({ _id: doctor });
    doctorData.appointments.push(appointment._id);
    const patientData = await Patient.findById({ _id: patient });
    patientData.appointments.push(appointment._id);

    await doctorData.save();
    await patientData.save();

    return res.status(201).json({ message: 'Appointment created successfully', appointment });
});

const updateAppointment = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    const updateFields = req.body;
    delete updateFields.id;

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
        .select('time dischargeTime status room patient disease doctor nurse hps tests')
        .populate([
            {
                path: 'patient',
                select: 'name gender age phoneNumber gname gPhoneNo appointments addr email userName',
                populate: {
                    path: 'appointments',
                    select: 'status time'
                }
            },
            { path: 'disease', select: 'name' },
            { path: 'doctor', select: 'name phoneNumber' },
            { path: 'nurse', select: 'name shift phoneNumber' },
            { path: 'hps', select: 'name phoneNumber' },
            { path: 'room', select: 'name bed' },
            {
                path: 'tests', select: 'test remarks',
                populate: {
                    path: 'test',
                    select: 'name'
                }
            },
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
