import mongoose, { Types } from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  disname : {type : String},
  dissymp : {type : String},
  disdesc : {type : String}
});

const Disease = mongoose.model('Disease', diseaseSchema);

export default Disease;