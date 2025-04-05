import express from 'express'
import {
    getAllHospitalStaff, 
    getThisHospitalStaff, 
    createHospitalStaff,
    updateHospitalStaff } from '../controllers/hsController.js'

const router = express.Router();
router.get('/allHospitalStaff', getAllHospitalStaff);
router.get('/thisHospitalStaff/:name', getThisHospitalStaff);
router.post('/createHospitalStaff', createHospitalStaff);
router.put('/updateHospitalStaff', updateHospitalStaff);

export default router;