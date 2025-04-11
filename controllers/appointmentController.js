import Appointment from '../models/appointmentModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllAppointment = tryCatch(async (req, res) => {
    const allAppointment = await Appointment.find({ active: true });
    return res.status(200).json({ success: true, data: allAppointment });
});

const renameFields = (obj, mapping) => {
    if (!obj) return obj;
    const newObj = { ...obj };
    for (const [oldKey, newKey] of Object.entries(mapping)) {
        if (newObj.hasOwnProperty(oldKey)) {
            newObj[newKey] = newObj[oldKey];
            delete newObj[oldKey];
        }
    }
    return newObj;
};

const getThisAppointment = tryCatch(async (req, res, next) => {
    const id = req.params.id;

    const appointment = await Appointment.findOne({ _id: id, active: true })
        .populate([
            { path: 'patient' },
            { path: 'doctor' },
            { path: 'nurse' },
            { path: 'tests' },
            { path: 'hps' },
            { path: 'hs' },
            { path: 'disease' },
            { path: 'assignedRoom' },
            { path: 'drugs.drug' },
        ]);

    if (!appointment) {
        return next(new ErrorHandler("Incorrect appointment id", 404));
    }

    const apptObj = appointment.toObject();

    // Define rename mappings
    const mappings = {
        disease: {
            disname: 'name',
            dissymp: 'symp',
            disdesc: 'desc',
        },
        doctor: {
            d_name: 'name',
            d_email: 'email',
            daddr: 'addr',
            dspec: 'spec',
            d_userName: 'userName',
        },
        nurse: {
            n_name: 'name',
            n_email: 'email',
            n_addr: 'addr',
            n_phoneNumber: 'phoneNumber',
            n_userName: 'userName',
        },
        patient: {
            pname: 'name',
            page: 'age',
            paddr: 'addr',
            p_phoneNumer: 'number',
            p_email: 'email',
            p_userName: 'userName',
        },
        hps: {
            h_name: 'name',
            haddr: 'addr',
            h_phoneNumber: 'phoneNumber',
            h_email: 'email',
            h_userName: 'userName',
        },
        hs: {
            s_name: 'name',
            s_addr: 'addr',
            s_phoneNumber: 'phoneNumber',
            s_email: 'email',
            s_userName: 'userName',
        },
        test: {
            tname: 'name',
            tequip: 'equip',
        },
        drug: {
            dgname: 'name',
            dgcomposition: 'composition',
        },
        treatment: {
            trname: 'name',
            trdesc: 'desc',
        },
    };

    // Rename all specified fields
    if (apptObj.doctor) {
        apptObj.doctor = renameFields(apptObj.doctor, mappings.doctor);
    }

    if (apptObj.patient) {
        apptObj.patient = renameFields(apptObj.patient, mappings.patient);
    }

    if (Array.isArray(apptObj.nurse)) {
        apptObj.nurse = apptObj.nurse.map(n => renameFields(n, mappings.nurse));
    }

    if (Array.isArray(apptObj.hps)) {
        apptObj.hps = apptObj.hps.map(hp => renameFields(hp, mappings.hps));
    }

    if (Array.isArray(apptObj.hs)) {
        apptObj.hs = apptObj.hs.map(hs => renameFields(hs, mappings.hs));
    }

    if (Array.isArray(apptObj.tests)) {
        apptObj.tests = apptObj.tests.map(test => renameFields(test, mappings.test));
    }

    if (Array.isArray(apptObj.disease)) {
        apptObj.disease = apptObj.disease.map(dis => renameFields(dis, mappings.disease));
    }

    if (Array.isArray(apptObj.drugs)) {
        apptObj.drugs = apptObj.drugs.map(d =>
            d?.drug ? { ...d, drug: renameFields(d.drug, mappings.drug) } : d
        );
    }

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
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

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

    const appointmentData = await Appointment.find({ [entity]: _id, status: "InProgress" })
        .select('assignedRoom patient disease doctor nurse hps')
        .populate([
            { path: 'patient', select: 'pname page gender guardian_name guardian_phoneNo' },
            { path: 'disease', select: 'disname' },
            { path: 'doctor', select: 'd_name phoneNumber' },
            { path: 'nurse', select: 'n_name shift n_phoneNumber' },
            { path: 'hps', select: 'h_name h_phoneNumber' },
            { path: 'assignedRoom', select: 'name' }
        ]);
    if (!appointmentData) return next(new ErrorHandler("Check for errors", 404));

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
