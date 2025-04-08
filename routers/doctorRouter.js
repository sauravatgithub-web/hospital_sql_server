import express from 'express'
import {
    getAllDoctor, 
    getThisDoctor, 
    createDoctor,
    updateDoctor, 
    getAppointments
} from '../controllers/doctorController.js'

const router = express.Router();
router.get('/all', getAllDoctor);
router.get('/thisDoctor/:name', getThisDoctor);
router.post('/new', createDoctor);
router.put('/update', updateDoctor);
router.get('/appointments', getAppointments);

export default router;