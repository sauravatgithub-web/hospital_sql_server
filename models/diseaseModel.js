import mongoose, { Types } from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  name : {type : String},
  symp : {type : String},
  desc : {type : String},
  active : {
    type : Boolean,
    default : true
  },
  appointments: [{ type: Types.ObjectId, ref: "Appointment" }],
  treatment: [{ type: Types.ObjectId, ref: "Treatment" }],
});

const Disease = mongoose.model('Disease', diseaseSchema);

export default Disease;