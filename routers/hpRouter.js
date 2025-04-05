import express from 'express'
import {
    getAllHospitalProfessional, 
    getThisHospitalProfessional, 
    createHospitalProfessional,
    updateHospitalProfessional } from '../controllers/hpController.js'

const router = express.Router();
router.get('/allHospitalProfessional', getAllHospitalProfessional);
router.get('/thisHospitalProfessional/:name', getThisHospitalProfessional);
router.post('/createHospitalProfessional', createHospitalProfessional);
router.put('/updateHospitalProfessional', updateHospitalProfessional);

export default router;