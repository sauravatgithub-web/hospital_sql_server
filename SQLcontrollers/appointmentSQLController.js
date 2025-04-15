import { 
    getAllAppointmentsQuery, 
    getAppointmentByIdQuery, 
    createAppointmentQuery, 
    updateAppointmentQuery, 
    deleteAppointmentQuery, 
    getCurrentAppointmentsQuery,
    dischargeAppointmentQuery
} from '../queries/appointmentQuery.js';
import { ErrorHandler } from '../utils/utility.js';
import { tryCatch } from '../middlewares/error.js';

// Controller for getting all active appointments
const getAllAppointment = tryCatch(async (req, res) => {
   const allAppointments = await getAllAppointmentsQuery();
   return res.status(200).json({ success: true, data: allAppointments });
});

const formatAppointment = (rows) => {
   const row = rows[0];
 
   const appointment = {
     _id: row.appointment_id,
     time: row.time,
     dischargeTime: row.dischargetime,
     status: row.status,
     active: row.active,
 
     patient: {
       _id: row.patient_id,
       name: row.patient_name,
       addr: row.patient_address,
       age: row.patient_age,
       phoneNumber: row.patient_phone,
       email: row.patient_email,
       userName: row.patient_username,
       gender: row.patient_gender,
       gname: row.patient_guardian_name,
       gPhoneNo: row.patient_guardian_phone,
     },
 
     doctor: {
       _id: row.doctor_id,
       name: row.doctor_name,
       gender: row.doctor_gender,
       phoneNumber: row.doctor_phone,
       inTime: row.doctor_in_time,
       outTime: row.doctor_out_time,
       spec: row.doctor_specialization,
       room: {
       _id: row.doctor_roomId,
       name: row.doctor_roomName,
     },
     },
 
     room: {
       _id: row.patient_roomId,
       name: row.patient_roomName,
     },
 
     bed: {
       _id: row.bed_id,
       name: row.bed_name,
       isOccupied: row.bed_occupied,
     },
 
     drugs: [],
     disease: [],
     tests: [],
     nurse: [],
     remarks: [],
     hps: [],
   };
 
   for (const r of rows) {
     if (r.drug_id && !appointment.drugs.find(d => d.drug && d.drug._id === r.drug_id)) {
       appointment.drugs.push({
         drug: { _id: r.drug_id, name: r.drug_name },
         dosage: r.drug_dosage,
       });
     }
 
     if (r.disease_id && !appointment.disease.find(d => d._id === r.disease_id)) {
       appointment.disease.push({
         _id: r.disease_id,
         name: r.disease_name,
       });
     }
 
     if (r.test_id && !appointment.tests.find(t => t.test && t.test._id === r.test_id)) {
       appointment.tests.push({
         test: {
           _id: r.test_id,
           name: r.test_name,
           room: r.test_room_id ? { _id: r.test_room_id, name: r.test_room_name } : undefined,
           doctor: r.test_doctor_id ? { _id: r.test_doctor_id, name: r.test_doctor_name } : undefined
         },
         remark: r.test_remark,
       });
     }
 
     if (r.nurse_id && !appointment.nurse.find(n => n._id === r.nurse_id)) {
       appointment.nurse.push({
         _id: r.nurse_id,
         name: r.nurse_name,
         phoneNumber: r.nurse_phone,
         shift: r.nurse_shift,
         gender: r.nurse_gender,
       });
     }
 
     if (r.nurse_id && r.nurse_remark_time && r.nurse_remark_msg) {
       appointment.remarks.push({
         remarkTime: r.nurse_remark_time,
         remarkUser: r.nurse_name,
         remarkUserRole: 'Nurse',
         remarkMsg: r.nurse_remark_msg,
       });
     }

     if (r.doctor_id && r.doctor_remark_time && r.doctor_remark_msg) {
      appointment.remarks.push({
        remarkTime: r.doctor_remark_time,
        remarkUser: r.doctor_name,
        remarkUserRole: 'Doctor',
        remarkMsg: r.doctor_remark_msg,
      });
    }
 
     if (r.hps_id && !appointment.hps.find(h => h._id === r.hps_id)) {
       appointment.hps.push({
         _id: r.hps_id,
         name: r.hps_name,
         phoneNumber: r.hps_phone,
         gender: r.hps_gender,
       });
     }
   }
 
   return appointment;
 };


// Controller for getting a specific appointment by ID
 const getThisAppointment = tryCatch(async (req, res, next) => {
   const { id } = req.params;
   const rows = await getAppointmentByIdQuery(id);
 
   if (!rows || rows.length === 0) {
     return next(new ErrorHandler('Incorrect appointment id', 404));
   }
 
   const appointment = formatAppointment(rows);
   return res.status(200).json({ success: true, appointment });
 });

// Controller for creating a new appointment
const createAppointment = tryCatch(async (req, res, next) => {
   const { time, patient, doctor, user } = req.body;

   if (!patient || !doctor ) {
      return next(new ErrorHandler("Insufficient input", 400));
   }

   const appointment= await createAppointmentQuery(time, patient, doctor, user);
   return res.status(201).json({ message: 'Appointment created successfully', appointment });
});

// Controller for updating an appointment
const updateAppointment = tryCatch(async (req, res, next) => {
   const {
     id,time,
     dischargeTime,status,
     doctorId,patientId,
     nurseIds,testDetails,
     hpsIds,diseaseIds,
     roomId,bedId,
     drugDetails,remarks
   } = req.body;
 
   if (!id || !doctorId || !patientId) {
     return next(new ErrorHandler("Insufficient input for update", 400));
   }
 
   await updateAppointmentQuery({
     id,time,
     dischargeTime,status,
     doctorId,patientId,
     nurseIds,testDetails,
     hpsIds,diseaseIds,
     roomId,bedId,
     drugDetails,remarks
   });

   const rows = await getAppointmentByIdQuery(id);
   const appointment = formatAppointment(rows);
 
   return res.status(200).json({ success: true, appointment });
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

   const appointments = formatAppointment(currentAppointments);
   return res.status(200).json({ success: true, appointments });
});

const dischargeAppointment = tryCatch(async (req,res,next)=>{
   const { id , dischargeTime } = req.body;
   if(!id || !dischargeTime) return next(new ErrorHandler("Insufficient Fields",404));

   const dischargeApp = await dischargeAppointmentQuery(id,dischargeTime);
   if(!dischargeApp) return next(new ErrorHandler("No appointment Found",404));

   return res.status(200).json({ success : true, dischargeApp});
});

export {
   getAllAppointment,
   getThisAppointment,
   createAppointment,
   updateAppointment,
   deleteAppointment,
   getCurrentAppointments,
   dischargeAppointment
};
