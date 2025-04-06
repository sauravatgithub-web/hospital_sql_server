import express from 'express'
import {
    getAllRoom, 
    getThisRoom, 
    createRoom,
    updateRoom } from '../controllers/roomController.js'

const router = express.Router();
router.get('/all', getAllRoom);
router.get('/thisRoom/:name', getThisRoom);
router.post('/create', createRoom);
router.put('/update', updateRoom);

export default router;