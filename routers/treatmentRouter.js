import express from 'express'
import {
    getAllTreatment, 
    getThisTreatment, 
    createTreatment,
    updateTreatment } from '../controllers/treatmentController.js'

const router = express.Router();
router.get('/all', getAllTreatment);
router.get('/thisTreatment/:name', getThisTreatment);
router.post('/new', createTreatment);
router.put('/update', updateTreatment);

export default router;