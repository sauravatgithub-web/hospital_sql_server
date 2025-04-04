import mongoose, { Types } from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  trname : {type : String},
  trdesc : {type : String}
});

const Treatment= mongoose.model('Treatment', testSchema);

export default Treatment;