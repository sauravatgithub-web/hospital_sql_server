import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  }
});

appointmentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;