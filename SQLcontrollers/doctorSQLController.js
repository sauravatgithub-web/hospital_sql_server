import {
    getAllDoctorsQuery,
    getDoctorByIdQuery,
    createDoctorQuery,
    updateDoctorQuery,
    deleteDoctorQuery,
    getDocAppointment
} from '../queries/doctorQuery.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

  
  const getAllDoctor = tryCatch(async (req, res) => {
    const result = await getAllDoctorsQuery();
    return res.status(200).json({ success: true, data: result.rows });
  });
  
  const getThisDoctor = tryCatch(async (req, res, next) => {
    const id = req.params.id;
    const result = await getDoctorByIdQuery(id);
    if (result.rowCount === 0) return next(new ErrorHandler("Invalid id", 404));
    return res.status(200).json({ success: true, doctor: result.rows[0] });
  });
  
  const createDoctor = tryCatch(async (req, res, next) => {
    const doctorData = { ...req.body, password: 'password' };
  
    const room = await client.query(`SELECT * FROM Room WHERE _id = $1 AND active = TRUE`, [doctorData.room]);
    if (room.rowCount === 0 || room.rows[0].vacancy <= 0) {
      return next(new ErrorHandler("Room is full or does not exist", 400));
    }
  
    const doctor = await createDoctorQuery(doctorData);
    await client.query(`UPDATE Room SET vacancy = vacancy - 1 WHERE _id = $1`, [doctorData.room]);
  
    return res.status(200).json({ success: true, doctor: doctor.rows[0] });
  });
  
  const updateDoctor = tryCatch(async (req, res, next) => {
    const { id, ...updates } = req.body;
    const result = await updateDoctorQuery(id, updates);
    if (result.rowCount === 0) return next(new ErrorHandler("Doctor not found", 404));
    return res.status(200).json({ message: 'Doctor updated successfully', doctor: result.rows[0] });
  });
  
  const deleteDoctor = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    const result = await deleteDoctorQuery(id);
    if (result.rowCount === 0) return next(new ErrorHandler("Doctor not found", 404));
    return res.status(200).json({ message: 'Doctor deleted successfully' });
  });

  const getAppointments = tryCatch(async (req, res, next) => {
    const { _id } = req.query; // Doctor's id
    
    // Check if the doctor exists and is active.
    const doctorResult = await client.query(
      `SELECT * FROM Doctor WHERE _id = $1 AND active = TRUE`,
      [_id]
    );
    if (doctorResult.rows.length === 0) return next(new ErrorHandler("Doctor not found", 404));
  
    // Single query joining Appointment with Patient and Disease data.
    const result = await getDocAppointment(_id);
  
    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, message: "No appointments found", appointments: [] });
    }
  
    // Group rows by appointment ID to build a single appointment object with nested arrays.
    const appointmentMap = new Map();
  
    result.rows.forEach(row => {
      const apptId = row.appt_id;
      if (!appointmentMap.has(apptId)) {
        appointmentMap.set(apptId, {
          _id: apptId,
          time: row.appt_time,
          dischargeTime: row.discharge_time,
          status: row.appt_status,
          patient: {
            _id: row.patient_id,
            name: row.patient_name,
            gender: row.patient_gender,
            age: row.patient_age,
            phoneNumber: row.patient_phonenumber,
            gname: row.patient_gname,
            gPhoneNo: row.patient_gphoneno,
            addr: row.patient_addr,
            email: row.patient_email,
            userName: row.patient_username
          },
          disease: [] // Will store disease names.
        });
      }
      const appointment = appointmentMap.get(apptId);
      // Add disease if available and not already included.
      if (row.disease_id && !appointment.disease.includes(row.disease_name)) {
        appointment.disease.push(row.disease_name);
      }
    });
  
    const appointments = Array.from(appointmentMap.values());
    return res.status(200).json({ success: true, appointments });
  });
  


export { 
    getAllDoctor, 
    getThisDoctor, 
    createDoctor, 
    updateDoctor, 
    deleteDoctor, 
    getAppointments 
}