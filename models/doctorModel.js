import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const doctorSchema = new mongoose.Schema({
  d_name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  daddr: { type: String },
  dspec: { type: String },
  inTime: { type: String },
  outTime: { type: String },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  d_email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  d_userName: {
    type: String,
    unique: true,
    default: function () {
      const namePart = this.d_name.toLowerCase().split(' ');
      const emailPart = this.d_email.toLowerCase().split('@')[0];
      return `${namePart.join('_')}_${emailPart}`;
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
  },
  role: {
    type: String,
    enum: ['Admin', 'Doctor', 'Nurse', 'Deo', 'Fdo'],
    default: 'Doctor'
  },
  qualification: { type: String },
  DOJ: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  room: { type: Types.ObjectId, ref: "Room" },
  hps: [{
    type: Types.ObjectId,
    ref: "Hospital_Professional"
  }],
  appointments: [{
    type: Types.ObjectId,
    ref: "Appointment"
  }],
  tests: [{ type: Types.ObjectId, ref: "Test" }]
});

doctorSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'room',
    select: 'name -_id'
  });
  this.populate('hps').populate('appointments');
  this.populate({
    path: 'tests',
    populate: {
      path: 'room',
      select: 'name' 
    }
  }); 
  next();
});

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 10);
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;