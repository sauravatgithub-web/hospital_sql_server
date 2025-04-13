import {
  getAllPatientQuery,
  getThisPatientQuery,
  getPatientByNumberQuery,
  createPatientQuery,
  updatePatientQuery,
  getPatientByEmailWithAppointments,
  getPatientByIdWithAppointments,
  deletePatientQuery
} from '../queries/patientQuery.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllPatient = tryCatch(async (req, res) => {
  const result = await getAllPatientQuery();
  return res.status(200).json({ success: true, data: result.rows });
});


const getThisPatient = tryCatch(async (req, res, next) => {
  const id = req.params.id;
  const result = await getThisPatientQuery(id);
  if (result.rows.length === 0) return next(new ErrorHandler("Incorrect patient ID", 404));
  return res.status(200).json({ success: true, patient: result.rows[0] });
});

const getPatientByNumber = tryCatch(async (req, res, next) => {
  const number = req.params.phoneNo;
  const result = await getPatientByNumberQuery(number);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("No match found", 404));
  }

  // Group appointments under patient
  const patient = {
    ...result.rows[0],
    appointments: result.rows
      .filter(r => r.appointment_id)
      .map(r => ({
        _id: r.appointment_id,
        time: r.atime,
        dischargeTime: r.dischargetime,
        status: r.status
      }))
  };

  return res.status(200).json({ success: true, patient });
});

const createPatient = tryCatch(async (req, res, next) => {
  const { name, addr, phoneNumber, email, gender, gname, gPhoneNo, age} = req.body;
  if (!name || !phoneNumber || !gname || !gPhoneNo || !email)
    return next(new ErrorHandler("Insufficient input", 404));

  await createPatientQuery(name, addr, phoneNumber, email, gender, gname, gPhoneNo, age);

  if (role === "FDO") {
    const result = await getPatientByEmailWithAppointments(email);
    const patient = {
      ...result.rows[0],
      appointments: result.rows
        .filter(r => r.appointment_id)
        .map(r => ({
          _id: r.appointment_id,
          time: r.atime,
          dischargeTime: r.dischargetime,
          status: r.status
        }))
    };
    return res.status(200).json({ success: true, message: "Patient created", patient });
  }

  return res.status(200).json({ success: true, message: "Patient created" });
});

const updatePatient = tryCatch(async (req, res, next) => {
  const { id, role, ...fields } = req.body;
  const updated = await updatePatientQuery(id, fields);

  if (!updated) return next(new ErrorHandler("Patient not found", 404));

  if (role === "FDO") {
    const result = await getPatientByIdWithAppointments(id);
    const patient = {
      ...result.rows[0],
      appointments: result.rows
        .filter(r => r.appointment_id)
        .map(r => ({
          _id: r.appointment_id,
          time: r.atime,
          dischargeTime: r.dischargetime,
          status: r.status
        }))
    };
    return res.status(200).json({ success: true, message: "Patient updated", patient });
  }

  return res.status(200).json({ success: true, message: 'Patient updated successfully' });
});


// const createPatient = tryCatch(async (req, res, next) => {
//   const { name, addr, phoneNumber, email, gender, gname, gPhoneNo, age, role } = req.body;
//   if (!name || !phoneNumber || !gname || !gPhoneNo || !email)
//     return next(new ErrorHandler("Insufficient input", 404));

//   await Patient.create({ ...req.body, password: 'password' });

//   if(role === "FDO") {
//     const patient = await Patient.findOne({ email: email }).populate({
//       path: 'appointments',
//       select: '_id time dischargeTime status'
//     });
//     return res.status(200).json({ success: true, message: "Patient created", patient: patient });
//   }
  
//   return res.status(200).json({ success: true, message: "Patient created" });
// });

// const updatePatient = tryCatch(async (req, res, next) => {
//   const { id, role } = req.body;
//   delete req.body.id;

//   const updatedPatient = await Patient.findByIdAndUpdate(
//     id,
//     req.body, 
//     { new: true, runValidators: true }
//   );

//   if(!updatedPatient) return next(new ErrorHandler("Patient not found", 404));

//   if(role === "FDO") {
//     const populatedPatient = await Patient.findById(id).populate({
//       path: 'appointments',
//       select: '_id time dischargeTime status'
//     });
//     return res.status(200).json({ success: true, message: "Patient updated", patient: populatedPatient });
//   }

//   return res.status(200).json({ success: true, message: 'Patient updated successfully', patient: updatedPatient });
// });


const deletePatient = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deletePatientQuery(id);
  if (result.rows.length === 0) return next(new ErrorHandler("Patient not found", 404));

  return res.status(200).json({ message: 'Patient deleted successfully' });
});

export { 
  getAllPatient, 
  getThisPatient, 
  getPatientByNumber, 
  createPatient, 
  updatePatient, 
  deletePatient 
}