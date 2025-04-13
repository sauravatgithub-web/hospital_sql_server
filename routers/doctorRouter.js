import express from 'express'
// import {
//     getAllDoctor, 
//     getThisDoctor, 
//     createDoctor,
//     updateDoctor, 
//     deleteDoctor,
//     getAppointments
// } from '../controllers/doctorController.js'

import {
    getAllDoctor, 
    getThisDoctor, 
    createDoctor,
    updateDoctor, 
    deleteDoctor,
    getAppointments
} from '../SQLcontrollers/doctorSQLController.js'

const router = express.Router();
router.get('/all', getAllDoctor);
router.get('/this/:id', getThisDoctor);
router.post('/new', createDoctor);
router.put('/update', updateDoctor);
router.delete('/delete', deleteDoctor)
router.get('/appointments', getAppointments);

export default router;