import express from 'express'
import {
    getAllNurse, 
    getThisNurse, 
    createNurse,
    updateNurse,
    deleteNurse 
} from '../controllers/nurseController.js'

const router = express.Router();
router.get('/all', getAllNurse);
router.get('/this/:id', getThisNurse);
router.post('/new', createNurse);
router.put('/update', updateNurse);
router.delete('/delete', deleteNurse);

export default router;