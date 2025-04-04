import mongoose, { Types } from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  trname : {type : String},
  trdesc : {type : String},
  doctor: { type: Types.ObjectId, ref: "Doctor" },
  patient: { type: Types.ObjectId, ref: "Patient" },
});

const Treatment= mongoose.model('Treatment', treatmentSchema);

export default Treatment;