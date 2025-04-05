import express from 'express'
import {
    getAllDisease, 
    getThisDisease, 
    createDisease,
    updateDisease } from '../controllers/diseaseController.js'

const router = express.Router();
router.get('/allDisease', getAllDisease);
router.get('/thisDisease/:name', getThisDisease);
router.post('/createDisease', createDisease);
router.put('/updateDisease', updateDisease);

export default router;