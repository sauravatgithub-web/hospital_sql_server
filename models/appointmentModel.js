import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  },
  patient: { type: Types.ObjectId, ref: "Patient" },
  doctor: { type: Types.ObjectId, ref: "Doctor" },
  nurse: [{ type: Types.ObjectId, ref: "Nurse" }],
  prescription: [{ type: Types.ObjectId, ref: "Drug" }],
  tests: [{ type: Types.ObjectId, ref: "Test" }],
  hps: [{ type: Types.ObjectId, ref: "Hospital_Professional" }],
  hs: [{ type: Types.ObjectId, ref: "Hospital_Staff" }],
  disease: [{ type: Types.ObjectId, ref: "Disease" }],
  assignedRoom: { type: Types.ObjectId, ref: "Room" },
  drugs: [{ type: Types.ObjectId, ref: "Drug" }],
});

appointmentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;