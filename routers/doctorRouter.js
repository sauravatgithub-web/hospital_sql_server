import express from 'express'
import {
    getAllDoctor, 
    getThisDoctor, 
    createDoctor,
    updateDoctor } from '../controllers/doctorController.js'

const router = express.Router();
router.get('/allDoctor', getAllDoctor);
router.get('/thisDoctor/:name', getThisDoctor);
router.post('/createDoctor', createDoctor);
router.put('/updateDoctor', updateDoctor);

export default router;