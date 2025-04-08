import express from 'express'
import {
    getAllHospitalStaff, 
    getThisHospitalStaff, 
    createHospitalStaff,
    updateHospitalStaff,
    deleteHospitalStaff 
} from '../controllers/hsController.js'

const router = express.Router();
router.get('/all', getAllHospitalStaff);
router.get('/thisHospitalStaff/:name', getThisHospitalStaff);
router.post('/new', createHospitalStaff);
router.put('/update', updateHospitalStaff);
router.delete('/delete', deleteHospitalStaff);

export default router;