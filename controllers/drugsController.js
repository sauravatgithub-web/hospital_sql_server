import Drug from '../models/drugsModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllDrug = tryCatch(async (req, res) => {
  const allDrugs = await Drug.find({active : true});
  const modifiedDrugs = allDrugs.map(drug => ({
    _id: drug._id,
    name: drug.dgname,
    composition: drug.dgcomposition
  }));
  return res.status(200).json({ success: true, data: modifiedDrugs });
});

const getThisDrug = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const drug = await Drug.find({ dgname: name, active : true });
  if (!drug) return next(new ErrorHandler("Incorrect drug name", 404));
  return res.status(200).json({ success: true, drug: drug });
});

const createDrug = tryCatch(async (req, res, next) => {
  const { name, composition } = req.body;
  if (!name || !composition) return next(new ErrorHandler("Insufficient input", 404));

  const reqData = {
    dgname: name,
    dgcomposition: composition
  }
  const drug = await Drug.create(reqData);
  return res.status(201).json({ message: 'Drug created successfully', drug });
});

const updateDrug = tryCatch(async (req, res, next) => {
  const { id, name, composition } = req.body;

  const drug = await Drug.findById(id);
  if (!drug) return next(new ErrorHandler("Drug not found", 404));

  drug.dgname = name;
  drug.dgcomposition = composition;
  await drug.save();

  return res.status(200).json({ message: 'Drug updated successfully', drug });
});

const deleteDrug = tryCatch(async(req, res, next) => {
  const { name } = req.params;
  const drug = await Drug.find({ name });
  if(!drug) return next(new ErrorHandler("Drug not found",404));
  drug.active = false;
  await drug.save();
  return res.status(200).json({message : 'Drug deleted successfully'});
});

export { getAllDrug, getThisDrug, createDrug, updateDrug, deleteDrug }