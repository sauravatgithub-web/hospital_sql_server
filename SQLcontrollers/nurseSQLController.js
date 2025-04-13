import {
    getAllNursesQuery,
    getNurseByIdQuery,
    createNurseQuery,
    updateNurseQuery,
    deleteNurseQuery
  } from '../queries/nurseQuery.js';
  
  import { tryCatch } from '../middlewares/error.js';
  import { ErrorHandler } from '../utils/utility.js';
  
const getAllNurse = tryCatch(async (req, res) => {
    const { rows } = await getAllNursesQuery();
    const nurseMap = new Map();

    for (const row of rows) {
      const nurseId = row.id;

      if (!nurseMap.has(nurseId)) {
        nurseMap.set(nurseId, {
          id: nurseId,
          name: row.name,
          email: row.email,
          addr: row.addr,
          phoneNumber: row.phonenumber,
          userName: row.username,
          shift: row.shift,
          gender: row.gender,
          qualification: row.qualification,
          role: row.role,
          active: row.active,
          appointments: [],
          tests: []
        });
      }

      const nurse = nurseMap.get(nurseId);

      // Add appointment if exists and not already added
      if (row.appointment_id && !nurse.appointments.some(a => a.id === row.appointment_id)) {
        nurse.appointments.push({
          id: row.appointment_id,
          date: row.appointment_date,
          patient_id: row.patient_id,
        });
      }

      // Add test if exists and not already added
      if (row.test_id && !nurse.tests.some(t => t.id === row.test_id)) {
        nurse.tests.push({
          id: row.test_id,
          name: row.test_name,
          room: row.room_id ? {
            id: row.room_id,
            name: row.room_name
          } : null
        });
      }
    }

    const result = Array.from(nurseMap.values());
    res.status(200).json(result);
  });



  
const getThisNurse = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { rows } = await getNurseByIdQuery(id);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nurse not found' });
    }

    // Group by nurse ID (since we are getting only one nurse, this is more relevant)
    const nurseMap = new Map();

    for (const row of rows) {
      const nurseId = row.id;

      if (!nurseMap.has(nurseId)) {
        nurseMap.set(nurseId, {
          id: nurseId,
          name: row.name,
          email: row.email,
          addr: row.addr,
          phoneNumber: row.phonenumber,
          userName: row.username,
          shift: row.shift,
          gender: row.gender,
          qualification: row.qualification,
          role: row.role,
          active: row.active,
          appointments: [],
          tests: []
        });
      }

      const nurse = nurseMap.get(nurseId);

      // Add appointment if exists and not already added
      if (row.appointment_id && !nurse.appointments.some(a => a.id === row.appointment_id)) {
        nurse.appointments.push({
          id: row.appointment_id,
          date: row.appointment_date,
          patient_id: row.patient_id,
        });
      }

      // Add test if exists and not already added
      if (row.test_id && !nurse.tests.some(t => t.id === row.test_id)) {
        nurse.tests.push({
          id: row.test_id,
          name: row.test_name,
          room: row.room_id ? {
            id: row.room_id,
            name: row.room_name
          } : null
        });
      }
    }

    const result = Array.from(nurseMap.values())[0]; // We expect only one nurse
    res.status(200).json(result);

});
  
const createNurse = tryCatch(async (req, res, next) => {
    const { name, addr, phoneNumber, email, gender, shift, qualification } = req.body;
  
    if (!name || !addr || !phoneNumber || !email || !shift || !gender)
      return next(new ErrorHandler("Insufficient input", 400));
  
    const password = "password";
    const namePart = name.toLowerCase().split(" ").join("_");
    const emailPart = email.toLowerCase().split("@")[0];
    const userName = `${namePart}_${emailPart}`;
  
    const nurse = { ...req.body, password, userName };
    await createNurseQuery(nurse);
  
    res.status(200).json({ success: true });
  });
  
const updateNurse = tryCatch(async (req, res, next) => {
    const { id, ...fieldsToUpdate } = req.body;
    const result = await updateNurseQuery(id, fieldsToUpdate);
  
    if (result.rowCount === 0)
      return next(new ErrorHandler("Nurse not found", 404));
  
    res.status(200).json({ success: true, nurse: result.rows[0] });
  });
  
const deleteNurse = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    await deleteNurseQuery(id);
    res.status(200).json({ message: 'Nurse deleted successfully' });
  });

export {
    getAllNurse,
    getThisNurse,
    createNurse,
    updateNurse,
    deleteNurse
}
  