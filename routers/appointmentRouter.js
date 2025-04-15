import express from 'express'
// import {
//     getAllAppointment, 
//     getThisAppointment, 
//     createAppointment,
//     updateAppointment,
//     deleteAppointment,
//     dischargeAppointment,
//     getCurrentAppointments
// } from '../controllers/appointmentController.js'

import {
    getAllAppointment, 
    getThisAppointment, 
    createAppointment,
    updateAppointment,
    deleteAppointment,
    dischargeAppointment,
    getCurrentAppointments
} from '../SQLcontrollers/appointmentSQLController.js'

const router = express.Router();
router.get('/all', getAllAppointment);
router.get('/this/:id', getThisAppointment);
router.get('/currentAppointments', getCurrentAppointments);
router.post('/new', createAppointment);
router.put('/update', updateAppointment);
router.put('/discharge', dischargeAppointment);
router.delete('/delete', deleteAppointment);

export default router;