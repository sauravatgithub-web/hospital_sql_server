import {
  getAllNursesQuery,
  getNurseByIdQuery,
  createNurseQuery,
  updateNurseQuery,
  deleteNurseQuery
} from '../queries/nurseQuery.js';

import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler, sendEmail } from '../utils/utility.js';

const getAllNurse = tryCatch(async (req, res) => {
  const result = await getAllNursesQuery();
  res.status(200).json({ success: true, data: result.rows });
});

const getThisNurse = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const result = await getNurseByIdQuery(id);

  if (!result || result.rows.length === 0) {
    return next(new ErrorHandler('Nurse not found', 404));
  }

  // Format the data
  const base = result.rows[0];
  const nurse = {
    _id: base._id,
    name: base.name,
    email: base.email,
    addr: base.addr,
    phoneNumber: base.phoneNumber,
    userName: base.userName,
    shift: base.shift,
    gender: base.gender,
    qualification: base.qualification,
    role: base.role,
    active: base.active,
    tests: []
  };

  // Group tests (if any)
  const testMap = new Map();
  result.rows.forEach(row => {
    if (!row.test_id) return;

    if (!testMap.has(row.test_id)) {
      testMap.set(row.test_id, {
        _id: row.test_id,
        name: row.test_name,
        equip: row.test_equip,
        room: row.room_id ? {
          _id: row.room_id,
          name: row.room_name
        } : null
      });
    }
  });

  nurse.tests = Array.from(testMap.values());

  return res.status(200).json({
    success: true,
    nurse,
  });
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

  await sendEmail(nurse.email, "New Joinee", null, 'Nurse', nurse.name);
  res.status(200).json({ success: true });
});

const updateNurse = tryCatch(async (req, res, next) => {
  const {id, name, gender, qualification, email,
    phoneNumber, addr, shift} = req.body;

  const result = await updateNurseQuery(id, name, gender, qualification, email,
    phoneNumber, addr, shift);

  if (result.rows === 0)
    return next(new ErrorHandler("No fields provided or Nurse not found", 404));

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
