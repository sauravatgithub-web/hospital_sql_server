import mongoose, { Types } from 'mongoose';

const drugSchema = new mongoose.Schema({
  name : {type : String},
  composition : {type : String},
  active : {
    type : Boolean,
    default : true
  },
  // appointment: [{type: Types.ObjectId, ref: "Appointment" }],
});

const Drug = mongoose.model('Drug', drugSchema);

export default Drug;