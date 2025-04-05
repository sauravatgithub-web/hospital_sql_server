import express from 'express'
import {
    getAllTreatment, 
    getThisTreatment, 
    createTreatment,
    updateTreatment } from '../controllers/treatmentController.js'

const router = express.Router();
router.get('/allTreatment', getAllTreatment);
router.get('/thisTreatment/:name', getThisTreatment);
router.post('/createTreatment', createTreatment);
router.put('/updateTreatment', updateTreatment);

export default router;