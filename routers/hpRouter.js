import express from 'express'
// import {
//     getAllHospitalProfessional, 
//     getThisHospitalProfessional, 
//     createHospitalProfessional,
//     updateHospitalProfessional,
//     deleteHospitalProfessional
// } from '../controllers/hpController.js'

import {
    getAllHospitalProfessional, 
    getThisHospitalProfessional, 
    createHospitalProfessional,
    updateHospitalProfessional,
    deleteHospitalProfessional
} from '../SQLcontrollers/hpSQLController.js'

const router = express.Router();
router.get('/all', getAllHospitalProfessional);
router.get('/this/:id', getThisHospitalProfessional);
router.post('/new', createHospitalProfessional);
router.put('/update', updateHospitalProfessional);
router.delete('/delete', deleteHospitalProfessional);

export default router;