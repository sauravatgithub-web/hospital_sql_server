import mongoose, { Types } from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  trname : {type : String},
  trdesc : {type : String},
  active : {
    type : Boolean,
    default : true
  },
  disease: { type: Types.ObjectId, ref: "Disease" },
});

const Treatment = mongoose.model('Treatment', treatmentSchema);

export default Treatment;