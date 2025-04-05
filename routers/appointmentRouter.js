import express from 'express'
import {
    getAllAppointment, 
    getThisAppointment, 
    createAppointment,
    updateAppointment } from '../controllers/appointmentController.js'

const router = express.Router();
router.get('/allAppointment', getAllAppointment);
router.get('/thisAppointment/:id', getThisAppointment);
router.post('/createAppointment', createAppointment);
router.put('/updateAppointment', updateAppointment);

export default router;