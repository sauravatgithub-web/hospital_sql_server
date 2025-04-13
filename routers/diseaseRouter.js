import express from 'express'
import {
    getAllDisease, 
    getThisDisease, 
    createDisease,
    updateDisease,
    deleteDisease
} from '../controllers/diseaseController.js'

const router = express.Router();
router.get('/all', getAllDisease);
router.get('/this/:id', getThisDisease);
router.post('/new', createDisease);
router.put('/update', updateDisease);
router.put('/delete', deleteDisease)

export default router;