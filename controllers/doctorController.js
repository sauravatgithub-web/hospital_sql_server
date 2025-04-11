import Doctor from '../models/doctorModel.js';
import Room from '../models/roomModel.js';
import Drug from '../models/doctorModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import Appointment from '../models/appointmentModel.js';

const getAllDoctor = tryCatch(async (req, res) => {
    const allDoctors = await Doctor.find({ active: true });
    return res.status(200).json({ success: true, data: allDoctors });
});

const getThisDoctor = tryCatch(async (req, res, next) => {
    const name = req.params.name;
    const doctor = await Doctor.find({ name: name, active : true });
    if (!doctor) return next(new ErrorHandler("Incorrect doctor name", 404));
    return res.status(200).json({ success: true, doctor: doctor });
});

const createDoctor = tryCatch(async (req, res, next) => {
    const {
        name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room
    } = req.body;

    if(!name || !addr || !phoneNumber || !email || !spec || !inTime || !outTime || !gender || !qualification || !room)
        return next(new ErrorHandler("Insufficient input", 404));

    const password = "password";
    const reqData = {
        ...req.body,
        password: password
    }

    const roomData = await Room.findById(room);
    if (!roomData || roomData.vacancy <= 0) return next(new ErrorHandler("Room is full", 400));

    await Doctor.create(reqData);
    roomData.vacancy -= 1;
    await roomData.save();

    return res.status(200).json({ success: true });
});

const updateDoctor = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    const doctor = await Doctor.findById(id);
    if(!doctor) return next(new ErrorHandler("Doctor not found", 404));

    Object.keys(req.body).forEach(key => {
        if (req.body[key] !== null && req.body[key] !== undefined) {
            doctor[key] = req.body[key];
        }
    });

    await doctor.save();
    return res.status(200).json({ message: 'Doctor updated successfully', doctor });
});

const deleteDoctor = tryCatch(async(req, res, next) => {
    const { id } = req.body;
    const doctor = await Doctor.findById(id);
    if(!doctor) return next(new ErrorHandler("Doctor not found", 404));
    doctor.active = false;
    await doctor.save();
    return res.status(200).json({message : 'Doctor deleted successfully'});
});

const getAppointments = tryCatch(async (req, res, next) => {
    const { _id } = req.query;
    const doctor = await Doctor.findById(_id);
    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

    const appointmentData = await Appointment.find({
        doctor: _id,
        status: { $in: ['Scheduled', 'Completed'] }
    })
        .select('time dischargeTime status patient disease')
        .populate([
            { path: 'patient', select: 'name age gender' },
            { path: 'disease', select: 'name' }
        ]);

    const appointments = appointmentData.map(appointment => ({
        _id: appointment._id,
        time: appointment.time,
        name: appointment.patient.name,
        age: appointment.patient.age,
        dischargeTime: appointment.dischargeTime,
        status: appointment.status,
        patient: appointment.patient,
        disease: appointment.disease.map(dis => dis.name)
    }));

    return res.status(200).json({ success: true, appointments });
});

export { getAllDoctor, getThisDoctor, createDoctor, updateDoctor, deleteDoctor, getAppointments }