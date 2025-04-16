import {
  getAllDiseaseQuery,
  getThisDiseaseQuery,
  createDiseaseQuery,
  updateDiseaseQuery,
  deleteDiseaseQuery
} from '../queries/diseaseQuery.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';


const getAllDisease = tryCatch(async (req, res) => {
  const result = await getAllDiseaseQuery();
  return res.status(200).json({ success: true, data: result.rows });
});

const getThisDisease = tryCatch(async (req, res, next) => {
  const name = req.params.name;
  const result = await getThisDiseaseQuery(name);
  if (result.rows.length === 0) {
    return next(new ErrorHandler("Incorrect Disease name", 404));
  }
  return res.status(200).json({ success: true, disease: result.rows[0] });
});

const createDisease = tryCatch(async (req, res, next) => {
  const { name, symp, desc } = req.body;
  if (!name || !symp || !desc) {
    return next(new ErrorHandler("Insufficient input", 400));
  }

  const result = await createDiseaseQuery(name, symp, desc);
  return res.status(201).json({ message: 'Disease created successfully', disease: result.rows[0] });
});

const updateDisease = tryCatch(async (req, res, next) => {
  const { id, name, symp, desc } = req.body;
  const result = await updateDiseaseQuery(id, name, symp, desc);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Disease not found", 404));
  }
  return res.status(200).json({ message: 'Disease updated successfully', drug: result.rows[0] });
});


const deleteDisease = tryCatch(async (req, res, next) => {
  const { id } = req.body;
  const result = await deleteDiseaseQuery(id);

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Disease not found", 404));
  }
  return res.status(200).json({ message: 'Disease deleted successfully' });
});

export { 
  getAllDisease, 
  getThisDisease, 
  createDisease, 
  updateDisease, 
  deleteDisease 
};
