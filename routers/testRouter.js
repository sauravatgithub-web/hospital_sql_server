import express from 'express'
// import {
//     getAllTest, 
//     getThisTest, 
//     createTest,
//     updateTest,
//     deleteTest 
// } from '../controllers/testController.js'

import {
    getAllTest,
    createTest,
    updateTest,
    deleteTest
} from '../SQLcontrollers/testSQLController.js'

const router = express.Router();
router.get('/all', getAllTest);
// router.get('/this/:id', getThisTest);
router.post('/new', createTest);
router.put('/update', updateTest);
router.delete('/delete', deleteTest);

export default router;