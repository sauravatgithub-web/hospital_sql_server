import mongoose, { Types } from 'mongoose';

const testSchema = new mongoose.Schema({
  tname : {type : String},
  tequip : {type : String},
  room: { type: Types.ObjectId, ref: "Room" },
  doctor: [{ type: Types.ObjectId, ref: "Doctor" }],
  nurse: [{ type: Types.ObjectId, ref: "Nurse" }],
});

const Test= mongoose.model('Test', testSchema);

export default Test;