import express from 'express'
// import {
//     getAllHospitalStaff, 
//     getThisHospitalStaff, 
//     createHospitalStaff,
//     updateHospitalStaff,
//     deleteHospitalStaff,
//     getCurrentAppointments, 
//     getAllCurrentDoctors,
//     getAllCurrentNurses
// } from '../controllers/hsController.js'

import {
    getAllHospitalStaff, 
    getThisHospitalStaff, 
    createHospitalStaff,
    updateHospitalStaff,
    deleteHospitalStaff,
    getCurrentAppointments, 
    getAllCurrentDoctors,
    getAllCurrentNurses
} from '../SQLcontrollers/hsSQLController.js'

const router = express.Router();
router.get('/all', getAllHospitalStaff);
router.get('/this/:id', getThisHospitalStaff);
router.get('/currentDoctors', getAllCurrentDoctors);
router.get('/currentNurses', getAllCurrentNurses);
router.get('/currentAppointments', getCurrentAppointments);
router.post('/new', createHospitalStaff);
router.put('/update', updateHospitalStaff);
router.delete('/delete', deleteHospitalStaff);

export default router;