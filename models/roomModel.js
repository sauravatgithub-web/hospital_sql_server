import mongoose, { Types } from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String },
  type : {
    type: String,
    enum: ["Consultation", "ICU", "General Ward", "Test Room"],
    default: "Consultation",
  },
  capacity : {type : Number},
  isAC : {type : Boolean},
  appointment: [{type: Types.ObjectId, ref: "Appointment" }],
  tests: [{ type: Types.ObjectId, ref: "Test" }],
  doctor: { type: Types.ObjectId, ref: "Doctor" },
});

const Room= mongoose.model('Room', roomSchema);

export default Room;