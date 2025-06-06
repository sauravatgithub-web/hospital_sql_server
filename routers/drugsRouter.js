import express from 'express'
// import {
//     getAllDrug, 
//     getThisDrug, 
//     createDrug,
//     updateDrug,
//     deleteDrug 
// } from '../controllers/drugsController.js'

import {
    getAllDrug, 
    getThisDrug, 
    createDrug,
    updateDrug,
    deleteDrug 
} from '../SQLcontrollers/drugsSQLController.js'

const router = express.Router();
router.get('/all', getAllDrug);
router.get('/this/:id', getThisDrug);
router.post('/new', createDrug);
router.put('/update', updateDrug);
router.delete('/delete', deleteDrug);

export default router;