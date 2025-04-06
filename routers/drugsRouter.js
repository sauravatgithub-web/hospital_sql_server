import express from 'express'
import {
    getAllDrug, 
    getThisDrug, 
    createDrug,
    updateDrug } from '../controllers/drugsController.js'

const router = express.Router();
router.get('/all', getAllDrug);
router.get('/thisDrug/:name', getThisDrug);
router.post('/new', createDrug);
router.put('/update', updateDrug);

export default router;