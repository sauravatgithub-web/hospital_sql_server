import express from 'express'
import {
    getAllDisease, 
    getThisDisease, 
    createDisease,
    updateDisease } from '../controllers/diseaseController.js'

const router = express.Router();
router.get('/all', getAllDisease);
router.get('/thisDisease/:name', getThisDisease);
router.post('/new', createDisease);
router.put('/update', updateDisease);

export default router;