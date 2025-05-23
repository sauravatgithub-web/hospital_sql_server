import express from 'express'
// import {
//     getAllPatient, 
//     getThisPatient, 
//     createPatient,
//     updatePatient,
//     deletePatient, 
//     getPatientByNumber
// } from '../controllers/patientController.js'

import {
    getAllPatient, 
    getThisPatient, 
    createPatient,
    updatePatient,
    deletePatient, 
    getPatientByNumber
} from '../SQLcontrollers/patientSQLController.js'

const router = express.Router();
router.get('/all', getAllPatient);
router.get('/this/:id', getThisPatient);
router.post('/new', createPatient);
router.put('/update', updatePatient);
router.delete('/delete', deletePatient);
router.get('/:phoneNo', getPatientByNumber);

export default router;