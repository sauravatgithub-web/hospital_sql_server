import express from 'express'
import {
    getAllNurse, 
    getThisNurse, 
    createNurse,
    updateNurse } from '../controllers/nurseController.js'

const router = express.Router();
router.get('/allNurse', getAllNurse);
router.get('/thisNurse/:name', getThisNurse);
router.post('/createNurse', createNurse);
router.put('/updateNurse', updateNurse);

export default router;