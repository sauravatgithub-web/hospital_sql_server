import mongoose, { Types } from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  disname : {type : String},
  dissymp : {type : String},
  disdesc : {type : String},
  assignedPatients: [{ type: Types.ObjectId, ref: "Patient" }],
});

const Disease = mongoose.model('Disease', diseaseSchema);

export default Disease;