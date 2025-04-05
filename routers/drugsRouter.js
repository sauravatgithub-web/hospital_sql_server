import express from 'express'
import {
    getAllDrug, 
    getThisDrug, 
    createDrug,
    updateDrug } from '../controllers/drugsController.js'

const router = express.Router();
router.get('/allDrug', getAllDrug);
router.get('/thisDrug/:name', getThisDrug);
router.post('/createDrug', createDrug);
router.put('/updateDrug', updateDrug);

export default router;