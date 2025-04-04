import mongoose, { Types } from 'mongoose';

const roomSchema = new mongoose.Schema({
  tor : {type : String},
  capacity : {type : Number},
  isAC : {type : Boolean},
  appointment: [{type: Types.ObjectId, ref: "Appointment" }],
  tests: [{ type: Types.ObjectId, ref: "Test" }],
  doctor: { type: Types.ObjectId, ref: "Doctor" },
});

const Room= mongoose.model('Room', roomSchema);

export default Room;