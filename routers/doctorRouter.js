import express from 'express'
import {
    getAllDoctor, 
    getThisDoctor, 
    createDoctor,
    updateDoctor 
} from '../controllers/doctorController.js'

const router = express.Router();
router.get('/all', getAllDoctor);
router.get('/thisDoctor/:name', getThisDoctor);
router.post('/new', createDoctor);
router.put('/update', updateDoctor);

export default router;