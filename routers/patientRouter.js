import express from 'express'
import {
    getAllPatient, 
    getThisPatient, 
    createPatient,
    updatePatient 
} from '../controllers/patientController.js'

const router = express.Router();
router.get('/all', getAllPatient);
router.get('/thisPatient/:name', getThisPatient);
router.post('/new', createPatient);
router.put('/update', updatePatient);

export default router;