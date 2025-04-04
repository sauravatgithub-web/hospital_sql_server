import mongoose, { Types } from 'mongoose';

const testSchema = new mongoose.Schema({
  tname : {type : String},
  tequip : {type : String},
  patient: {type: Types.ObjectId, ref: "Patient" }
});

const Test= mongoose.model('Test', testSchema);

export default Test;