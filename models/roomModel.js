import mongoose, { Types } from 'mongoose';

const roomSchema = new mongoose.Schema({
  tor : {type : String},
  capacity : {type : Number},
  isAC : {type : Boolean}
});

const Room= mongoose.model('Room', roomSchema);

export default Room;