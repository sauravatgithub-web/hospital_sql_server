import express from 'express'
import {
    getAllNurse, 
    getThisNurse, 
    createNurse,
    updateNurse 
} from '../controllers/nurseController.js'

const router = express.Router();
router.get('/all', getAllNurse);
router.get('/thisNurse/:name', getThisNurse);
router.post('/new', createNurse);
router.put('/update', updateNurse);

export default router;