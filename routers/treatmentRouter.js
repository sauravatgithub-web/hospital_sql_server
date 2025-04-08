import express from 'express'
import {
    getAllTreatment, 
    getThisTreatment, 
    createTreatment,
    updateTreatment,
    deleteTreatment 
} from '../controllers/treatmentController.js'

const router = express.Router();
router.get('/all', getAllTreatment);
router.get('/thisTreatment/:name', getThisTreatment);
router.post('/new', createTreatment);
router.put('/update', updateTreatment);
router.delete('/delete', deleteTreatment);

export default router;