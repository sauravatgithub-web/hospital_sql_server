import { 
    getAllAppointmentsQuery, 
    getAppointmentByIdQuery, 
    createAppointmentQuery, 
    updateAppointmentQuery, 
    deleteAppointmentQuery, 
    getCurrentAppointmentsQuery 
} from '../queries/appointmentQuery.js';
import { ErrorHandler } from '../utils/utility.js';
import { tryCatch } from '../middlewares/error.js';

// Controller for getting all active appointments
const getAllAppointment = tryCatch(async (req, res) => {
const allAppointments = await getAllAppointmentsQuery();
return res.status(200).json({ success: true, data: allAppointments });
});

// Controller for getting a specific appointment by ID
const getThisAppointment = tryCatch(async (req, res, next) => {
const { id } = req.params;
const appointment = await getAppointmentByIdQuery(id);

if (!appointment || appointment.length === 0) {
   return next(new ErrorHandler('Incorrect appointment id', 404));
}

return res.status(200).json({ success: true, appointment: appointment[0] });
});

// Controller for creating a new appointment
const createAppointment = tryCatch(async (req, res, next) => {
const { time, dischargeTime, patient, doctor, room } = req.body;

if (!patient || !doctor || !room) {
   return next(new ErrorHandler("Insufficient input", 400));
}

const appointmentId = await createAppointmentQuery(time, dischargeTime, patient, doctor, room);

// Update doctor and patient with the appointment ID
await client.query(`
   UPDATE doctor SET appointments = array_append(appointments, $1) WHERE _id = $2;
`, [appointmentId, doctor]);

await client.query(`
   UPDATE patient SET appointments = array_append(appointments, $1) WHERE _id = $2;
`, [appointmentId, patient]);

return res.status(201).json({ message: 'Appointment created successfully', appointment: { _id: appointmentId, time, dischargeTime } });
});

// Controller for updating an appointment
const updateAppointment = tryCatch(async (req, res, next) => {
const { id, time, dischargeTime, status, doctor, nurse, room } = req.body;
const updatedAppointment = await updateAppointmentQuery(time, dischargeTime, status, doctor, nurse, room, id);

if (!updatedAppointment) {
   return next(new ErrorHandler("Appointment not found", 404));
}

return res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
});

// Controller for deleting an appointment (mark as inactive)
const deleteAppointment = tryCatch(async (req, res, next) => {
const { id } = req.body;
const deletedAppointment = await deleteAppointmentQuery(id);

if (!deletedAppointment) {
   return next(new ErrorHandler("Appointment not found", 404));
}

return res.status(200).json({ message: 'Appointment deleted successfully' });
});

// Controller for getting current appointments (InProgress)
const getCurrentAppointments = tryCatch(async (req, res, next) => {
const { entity, _id } = req.query;
const currentAppointments = await getCurrentAppointmentsQuery(entity, _id);

if (!currentAppointments || currentAppointments.length === 0) {
   return next(new ErrorHandler("No appointments found", 404));
}

return res.status(200).json({ success: true, appointments: currentAppointments });
});

export {
getAllAppointment,
getThisAppointment,
createAppointment,
updateAppointment,
deleteAppointment,
getCurrentAppointments
};
