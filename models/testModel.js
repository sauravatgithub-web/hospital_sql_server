import mongoose, { Types } from 'mongoose';

const testSchema = new mongoose.Schema({
  name : {type : String},
  equip : {type : String},
  active : {
    type : Boolean,
    default : true
  },
  room: { type: Types.ObjectId, ref: "Room" },
  doctor: { type: Types.ObjectId, ref: "Doctor" },
  nurse: { type: Types.ObjectId, ref: "Nurse" },
});

const Test= mongoose.model('Test', testSchema);

export default Test;