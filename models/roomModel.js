import mongoose, { Types } from 'mongoose';

const roomSchema = new mongoose.Schema({
  tor : {type : String},
  capacity : {type : Number},
  isAC : {type : Boolean},
  assignedPatient: { type: Types.ObjectId, ref: "Patient" }
});

const Room= mongoose.model('Room', roomSchema);

export default Room;