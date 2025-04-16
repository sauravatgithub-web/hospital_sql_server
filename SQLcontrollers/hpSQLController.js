import {
  getAllHospitalProfessionalsQuery,
  getOneHospitalProfessionalQuery,
  createHospitalProfessionalQuery,
  insertDoctorHpRelationQuery,
  updateHospitalProfessionalQuery,
  getUpdatedHospitalProfessionalQuery,
  deleteHospitalProfessionalQuery
} from '../queries/hpQuery.js';

import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import client from "../db.js"

const getAllHospitalProfessional = tryCatch(async (req, res) => {
  const result = await getAllHospitalProfessionalsQuery();
  res.status(200).json({ success: true, data: result.rows });
});

const getThisHospitalProfessional = tryCatch(async (req, res, next) => {
  const result = await getOneHospitalProfessionalQuery(req.params.id);
  if (result.rows.length === 0)
    return next(new ErrorHandler("Incorrect user name", 404));
  res.status(200).json({ success: true, user: result.rows[0] });
});

const createHospitalProfessional = tryCatch(async (req, res, next) => {
  const { name, addr, phoneNumber, email, gender, uni, degree, supervisedBy } = req.body;
  if (!name || !addr || !phoneNumber || !email || !uni || !degree || !gender)
    return next(new ErrorHandler("Insufficient input", 404));

  const { rows } = await createHospitalProfessionalQuery({ name, addr, phoneNumber, email, gender, uni, degree });
  const hpId = rows[0]._id;

  for (const did of supervisedBy) {
    await insertDoctorHpRelationQuery(did, hpId);
  }

  await sendEmail(email, "New Joinee", null, 'Hospital Professional', name);
  res.status(200).json({ success: true });
});

const updateHospitalProfessional = tryCatch(async (req, res, next) => {
  const { id, supervisedBy, name, addr, phoneNumber, email, gender, uni, degree } = req.body;
  const fieldsToUpdate = { name, addr, "phoneNumber": phoneNumber, email, gender, uni, degree };

  // 1. Update the HP record
  await updateHospitalProfessionalQuery(id, fieldsToUpdate);

  // 2. Clear existing doctor-hp relations for this HP
  await client.query('DELETE FROM Supervises WHERE hid = $1;', [id]);

  // 3. Add new doctor-hp pairs
  for (const doctorId of supervisedBy) {
    await insertDoctorHpRelationQuery(doctorId, id);
  }

  // 4. Fetch updated HP with populated supervisor info
  const result = await getUpdatedHospitalProfessionalQuery(id);
  res.status(200).json({
    message: 'Updated successfully',
    hospitalProfessional: result.rows[0]
  });
});


const deleteHospitalProfessional = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteHospitalProfessionalQuery(id);
  if (result.rows.length === 0)
    return next(new ErrorHandler("Hospital Professional not found", 404));
  res.status(200).json({ message: "Deleted successfully" });
});

export {
  getAllHospitalProfessional,
  getThisHospitalProfessional,
  createHospitalProfessional,
  updateHospitalProfessional,
  deleteHospitalProfessional
}