import Doctor from '../models/doctorModel.js';
import Room from '../models/roomModel.js';
import Drug from '../models/doctorModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import Appointment from '../models/appointmentModel.js';

const getAllDoctor = tryCatch(async (req, res) => {
    const allDoctors = await Doctor.find({ active: true });

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

const getThisDoctor = tryCatch(async (req, res, next) => {
    const name = req.params.name;
    const doctor = await Doctor.find({ d_name: name, active : true });
    if (!doctor) return next(new ErrorHandler("Incorrect doctor name", 404));
    return res.status(200).json({ success: true, doctor: doctor });
});

const createDoctor = tryCatch(async (req, res, next) => {
    const {
        name, addr, spec, inTime, outTime, phoneNumber, email, gender, qualification, room
    } = req.body;

    if (!name || !addr || !phoneNumber || !email || !spec || !inTime || !outTime || !room)
        return next(new ErrorHandler("Insufficient input", 404));

    const password = "password";

    const reqData = {
        d_name: name,
        daddr: addr, dspec: spec,
        inTime, outTime, phoneNumber,
        d_email: email,
        gender, qualification,
        password: password, room
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
    const updateFields = req.body;

    const fieldMap = {
        name: 'd_name',
        addr: 'daddr',
        spec: 'dspec',
        email: 'd_email',
        username: 'd_userName'
    };

    const doctor = await Doctor.findById(id);
    if (!doctor) {
        return next(new ErrorHandler("Doctor not found", 404));
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

const deleteDoctor = tryCatch(async(req, res, next) => {
    const { id } = req.body;
    const doctor = await Doctor.findById(id);
    if(!doctor) return next(new ErrorHandler("Doctor not found",404));
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
            { path: 'patient', select: 'pname page gender' },
            { path: 'disease', select: 'disname' }
        ]);
    console.log(appointmentData);

    const appointments = appointmentData.map(appointment => ({
        _id: appointment._id,
        time: appointment.time,
        name: appointment.patient.pname,
        age: appointment.patient.page,
        dischargeTime: appointment.dischargeTime,
        status: appointment.status,
        patient: appointment.patient,
        disease: appointment.disease.map(dis => dis.disname)
    }));

    return res.status(200).json({ success: true, appointments });
});

export { getAllDoctor, getThisDoctor, createDoctor, updateDoctor, deleteDoctor, getAppointments }