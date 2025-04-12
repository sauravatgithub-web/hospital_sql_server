import express from 'express'
import {
    getAllAppointment, 
    getThisAppointment, 
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getCurrentAppointments
} from '../controllers/appointmentController.js'

const router = express.Router();
router.get('/all', getAllAppointment);
router.get('/currentAppointments', getCurrentAppointments);
router.post('/new', createAppointment);
router.put('/update', updateAppointment);
router.delete('/delete', deleteAppointment);
router.get('/:id', getThisAppointment);

export default router;