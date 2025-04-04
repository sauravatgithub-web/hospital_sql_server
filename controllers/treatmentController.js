import Treatment from '../models/treatmentModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createTreatment = tryCatch(async (req, res, next) => {
    const { name, desc, disease } = req.body;
  
    if (!name || !disease)
      return next(new ErrorHandler("Insufficient input", 400));
    const reqData = {
        trname : name,
        trdesc : desc,
        disease  
    }
    const newTreatment = await Treatment.create({reqData});
  
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

export {createTreatment, updateTreatment}
  
  