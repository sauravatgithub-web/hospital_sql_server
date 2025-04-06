import express from 'express'
import {
    getAllTest, 
    getThisTest, 
    createTest,
    updateTest } from '../controllers/testController.js'

const router = express.Router();
router.get('/all', getAllTest);
router.get('/thisTest/:name', getThisTest);
router.post('/new', createTest);
router.put('/update', updateTest);

export default router;