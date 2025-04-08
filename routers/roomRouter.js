import express from 'express'
import {
    getAllRoom, 
    getThisRoom, 
    getAllVacantRooms,
    createRoom,
    updateRoom,
    deleteRoom 
} from '../controllers/roomController.js'

const router = express.Router();
router.get('/all', getAllRoom);
router.get('/thisRoom/:name', getThisRoom);
router.get('/allVacantRooms', getAllVacantRooms);
router.post('/new', createRoom);
router.put('/update', updateRoom);
router.delete('/delete', deleteRoom);

export default router;