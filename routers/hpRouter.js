import express from 'express'
import {
    getAllHospitalProfessional, 
    getThisHospitalProfessional, 
    createHospitalProfessional,
    updateHospitalProfessional 
} from '../controllers/hpController.js'

const router = express.Router();

router.get('/all', getAllHospitalProfessional);
router.get('/thisHospitalProfessional/:name', getThisHospitalProfessional);
router.post('/new', createHospitalProfessional);
router.put('/update', updateHospitalProfessional);

export default router;