import Drug from '../models/drug.model.js'; 
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createDrug = tryCatch(async (req, res, next) => {
  const { name, composition } = req.body;
  if(!name || !composition) return next(new ErrorHandler("Insufficient input",404));
  
  const reqData = {
    dgname : name,
    dgcomposition : composition
  }
  const drug = await Drug.create({ reqData });
  return res.status(201).json({ message: 'Drug created successfully', drug });
});

const updateDrug = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const drug = await Drug.findByIdAndUpdate(id, updateFields, { new: true });

  if (!drug) {
    return next(new ErrorHandler("Drug not found",404));
  }

  return res.status(200).json({ message: 'Drug updated successfully', drug });
});

export {createDrug, updateDrug}