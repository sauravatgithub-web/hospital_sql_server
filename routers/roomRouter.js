import express from 'express'
import {
    getAllRoom, 
    getThisRoom, 
    createRoom,
    updateRoom } from '../controllers/roomController.js'

const router = express.Router();
router.get('/allRoom', getAllRoom);
router.get('/thisRoom/:name', getThisRoom);
router.post('/createRoom', createRoom);
router.put('/updateRoom', updateRoom);

export default router;