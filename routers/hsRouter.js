import express from 'express'
import {
    getAllHospitalStaff, 
    getThisHospitalStaff, 
    createHospitalStaff,
    updateHospitalStaff } from '../controllers/hsController.js'

const router = express.Router();
router.get('/all', getAllHospitalStaff);
router.get('/thisHospitalStaff/:name', getThisHospitalStaff);
router.post('/new', createHospitalStaff);
router.put('/update', updateHospitalStaff);

export default router;