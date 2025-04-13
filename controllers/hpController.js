import Hospital_Professional from '../models/hpModel.js';
import Doctor from '../models/doctorModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllHospitalProfessional = tryCatch(async (req, res) => {
  const allHp = await Hospital_Professional.find({ active: true }).populate({
    path: 'supervisedBy',
    select: 'name'
  });
  return res.status(200).json({ success: true, data: allHp });
});

const getThisHospitalProfessional = tryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await Hospital_Professional.find({ _id: id, active: true });
  if (!user) return next(new ErrorHandler("Incorrect user name", 404));
  return res.status(200).json({ success: true, user: user });
});

const createHospitalProfessional = tryCatch(async (req, res, next) => {
  const { name, addr, phoneNumber, email, gender, uni, degree, supervisedBy } = req.body;
  if (!name || !addr || !phoneNumber || !email || !uni || !degree || !gender)
    return next(new ErrorHandler("Insufficient input", 404));

  const password = "password";
  const reqData = { ...req.body, password: password };
  const hp = await Hospital_Professional.create(reqData);

  await Promise.all(
    Object.entries(supervisedBy).map(async ([doctorId, shouldAdd]) => {
      if (shouldAdd === 1) {
        const doctorData = await Doctor.findById({ _id: doctorId });
        if (doctorData) {
          doctorData.hps.push(hp._id);
          await doctorData.save();
        }
      }
    })
  );

  return res.status(200).json({ success: true });
});


const updateHospitalProfessional = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const updatedFields = req.body;
  delete updatedFields._id;

  const hp = await Hospital_Professional.findById(id);
  await Promise.all(
    hp.supervisedBy.map(async (doctor) => {
      if(!updatedFields.supervisedBy.includes(doctor)) {
        const doctorData = await Doctor.findById({ _id: doctor });
        if (doctorData) {
          doctorData.hps.filter((hp) => hp !== id);
          await doctorData.save();
        }
      }
    })
  );

  await Promise.all(
    updatedFields.supervisedBy.map(async (doctor) => {
      const doctorData = await Doctor.findById({ _id: doctor });
      if(!doctorData.hps.includes(id)) {
        doctorData.hps.push(id);
        await doctorData.save();
      }
    })
  );

  const updatedHP = await Hospital_Professional.findByIdAndUpdate(id, updatedFields, { new: true });
  if (!updatedHP) return next(new ErrorHandler("Hospital Professional not found", 404));

  return res.status(200).json({ message: 'Hospital Professional updated successfully', hospitalProfessional: updatedHP });
});

const deleteHospitalProfessional = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const hp = await Hospital_Professional.findById(id);
  if (!hp) return next(new ErrorHandler("Hospital Professional not found", 404));
  hp.active = false;
  await hp.save();
  return res.status(200).json({ message: 'Hospital Professional deleted successfully' });
});

export {
  getAllHospitalProfessional,
  getThisHospitalProfessional,
  createHospitalProfessional,
  updateHospitalProfessional,
  deleteHospitalProfessional
}
