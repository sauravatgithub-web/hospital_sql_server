import mongoose, { Types } from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  },
  dischargeTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'InProgress'],
    default: 'Scheduled',
  },
  active: {
    type: Boolean,
    default: true
  },
  patient: { type: Types.ObjectId, ref: "Patient" },
  doctor: { type: Types.ObjectId, ref: "Doctor" },
  nurse: [{ type: Types.ObjectId, ref: "Nurse" }],
  remarks: [{
    remarkTime: { type: Date, default: Date.now },
    remarkUser: { type: String },
    remarkUserRole: { type: String },
    remarkMsg: { type: String }
  }],
  tests: [{ 
    test : {
      type: Types.ObjectId, 
      ref: "Test" 
    },
    remark : {type : String}
  }],
  hps: [{ type: Types.ObjectId, ref: "Hospital_Professional" }],
  hs: [{ type: Types.ObjectId, ref: "Hospital_Staff" }],
  disease: [{ type: Types.ObjectId, ref: "Disease" }],
  room: { type: Types.ObjectId, ref: "Room" },
  bed: { type: Number },
  drugs: [{
    drug: { 
      type: Types.ObjectId, 
      ref: "Drug" 
    },
    dosage: { type: String }
  }],
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;