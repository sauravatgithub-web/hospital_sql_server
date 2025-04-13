import {
  getAllDrugQuery,
  getThisDrugQuery,
  createDrugQuery,
  updateDrugQuery,
  deleteDrugQuery
} from '../queries/drugQuery.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllDrug = tryCatch(async (req, res) => {
  const result = await getAllDrugQuery();
  return res.status(200).json({ success: true, data: result.rows });
});


const getThisDrug = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const result = await getThisDrugQuery(name);
  if (result.rows.length === 0) {
    return next(new ErrorHandler("Incorrect drug name", 404));
  }
  return res.status(200).json({ success: true, drug: result.rows[0] });
});


const createDrug = tryCatch(async (req, res, next) => {
  const { name, composition } = req.body;
  if (!name || !composition) {
    return next(new ErrorHandler("Insufficient input", 400));
  }

  const result = await createDrugQuery(name, composition);
  return res.status(201).json({ message: 'Drug created successfully', drug: result.rows[0] });
});


const updateDrug = tryCatch(async (req, res, next) => {
  const { id, name, composition } = req.body;
  const result = await updateDrugQuery(id, name, composition);
  
  if (result.rows.length === 0) {
    return next(new ErrorHandler("Drug not found", 404));
  }
  return res.status(200).json({ message: 'Drug updated successfully', drug: result.rows[0] });
});


const deleteDrug = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteDrugQuery(id);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Drug not found", 404));
  }
  return res.status(200).json({ message: 'Drug deleted successfully' });
});


export { getAllDrug, getThisDrug, createDrug, updateDrug, deleteDrug }