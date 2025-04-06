import Disease from '../models/diseaseModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllDisease = tryCatch(async(req, res) => {
    const allDiseases = await Disease.find();
    const modifiedDiseases = allDiseases.map(disease => ({
        _id: disease._id,
        name: disease.disname,
        symp: disease.dissymp,
        desc: disease.disdesc
    }));
    return res.status(200).json({ success: true, data: modifiedDiseases });
});

const getThisDisease = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const disease = await Disease.find({disname : name});
    if(!disease) return next(new ErrorHandler("Incorrect disease name", 404));
    return res.status(200).json({ success: true, disease: disease });
});

const createDisease = tryCatch(async (req, res, next) => {
    const { name , symp, desc } = req.body;
    if( !name || !symp || !desc ) return next(new ErrorHandler("Insufficient input",404));

    const reqData = {
        disname : name,
        dissymp : symp,
        disdesc : desc
    }

    const disease = await Disease.create(reqData);
    return res.status(201).json({ message: 'Disease created successfully', disease });
});

const updateDisease = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const updateFields = req.body;
  
    const disease = await Disease.findByIdAndUpdate(id, updateFields, { new: true });
  
    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }
  
    return res.status(200).json({ message: 'Disease updated successfully', disease });
  });

export {getAllDisease,getThisDisease, createDisease, updateDisease };
