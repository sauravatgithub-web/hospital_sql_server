import mongoose, { Types } from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  disname : {type : String},
  dissymp : {type : String},
  disdesc : {type : String},
  appointments: [{ type: Types.ObjectId, ref: "Appointment" }],
  treatment: [{ type: Types.ObjectId, ref: "Treatment" }],
});

const Disease = mongoose.model('Disease', diseaseSchema);

export default Disease;