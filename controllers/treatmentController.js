import Treatment from '../models/treatmentModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllTreatment = tryCatch(async (req, res) => {
  const allTreatment = await Treatment.find({active : true});
  const modifiedTreatment = allTreatment.map(treatment => ({
    _id: treatment._id,
    name: treatment.trname,
    disease: treatment.disease,
    desc: treatment.trdesc
  }))
  return res.status(200).json({ success: true, data: modifiedTreatment });
});

const getThisTreatment = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const treatment = await Treatment.find({ trname: name,active : true });
  if (!treatment) return next(new ErrorHandler("Incorrect test name", 404));
  return res.status(200).json({ success: true, treatment: treatment });
});

const createTreatment = tryCatch(async (req, res, next) => {
  const { name, desc, disease } = req.body;
  if (!name || !disease) return next(new ErrorHandler("Insufficient input", 400));

  const reqData = {
    trname: name,
    trdesc: desc,
    disease
  }
  const newTreatment = await Treatment.create(reqData);
  return res.status(200).json({ success: true, message: "Treatment created", treatment: newTreatment });
});

const updateTreatment = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const updatedTreatment = await Treatment.findByIdAndUpdate(id, updateFields, { new: true });

  if (!updatedTreatment)
    return next(new ErrorHandler("Treatment not found", 404));

  return res.status(200).json({ success: true, message: "Treatment updated", treatment: updatedTreatment });
});

const deleteTreatment = tryCatch(async(req, res, next) => {
  const { id } = req.body;
  const treatment = await Treatment.findById(id);
  if(!treatment) return next(new ErrorHandler("Treatment not found",404));
  treatment.active = false;
  await treatment.save();
  return res.status(200).json({message : 'Treatment deleted successfully'});
});

export { getAllTreatment, getThisTreatment, createTreatment, updateTreatment, deleteTreatment }