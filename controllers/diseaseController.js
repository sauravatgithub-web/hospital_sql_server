import Disease from '../models/diseaseModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllDisease = tryCatch(async (req, res) => {
    const allDiseases = await Disease.find({active : true});
    return res.status(200).json({ success: true, data: allDiseases });
});

const getThisDisease = tryCatch(async (req, res, next) => {
    const name = req.params.name;
    const disease = await Disease.find({ name: name, active : true });
    if (!disease) return next(new ErrorHandler("Incorrect disease name", 404));
    return res.status(200).json({ success: true, disease: disease });
});

const createDisease = tryCatch(async (req, res, next) => {
    const { name, symp, desc } = req.body;
    if (!name || !symp || !desc) return next(new ErrorHandler("Insufficient input", 404));
    const disease = await Disease.create(req.body);
    return res.status(201).json({ message: 'Disease created successfully', disease });
});

const updateDisease = tryCatch(async (req, res, next) => {
    const { id } = req.body;
    const disease = await Disease.findByIdAndUpdate(id, req.body, { new: true });
    if(!disease) return res.status(404).json({ message: 'Disease not found' });
    return res.status(200).json({ message: 'Disease updated successfully', disease });
});

const deleteDisease = tryCatch(async(req, res, next) => {
    const { id } = req.body;
    const disease = await Disease.findById(id);
    if(!disease) return next(new ErrorHandler("Disease not found",404));
    disease.active = false;
    await disease.save();
    return res.status(200).json({message : 'Disease deleted successfully'});
});

export { getAllDisease, getThisDisease, createDisease, updateDisease, deleteDisease };
