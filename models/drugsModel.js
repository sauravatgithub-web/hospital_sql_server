import mongoose, { Types } from 'mongoose';

const drugSchema = new mongoose.Schema({
  dgname : {type : String},
  dgcomposition : {type : String}
});

const Drug = mongoose.model('Drug', drugSchema);

export default Drug;