import express from 'express'
import {
    getAllPatient, 
    getThisPatient, 
    createPatient,
    updatePatient } from '../controllers/patientController.js'

const router = express.Router();
router.get('/allPatient', getAllPatient);
router.get('/thisPatient/:name', getThisPatient);
router.post('/createPatient', createPatient);
router.put('/updatePatient', updatePatient);

export default router;