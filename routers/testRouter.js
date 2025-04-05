import express from 'express'
import {
    getAllTest, 
    getThisTest, 
    createTest,
    updateTest } from '../controllers/testController.js'

const router = express.Router();
router.get('/allTest', getAllTest);
router.get('/thisTest/:name', getThisTest);
router.post('/createTest', createTest);
router.put('/updateTest', updateTest);

export default router;