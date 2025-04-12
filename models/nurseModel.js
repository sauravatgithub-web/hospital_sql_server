import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const nurseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
  addr: { type: String },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  userName :{
    type : String,
    unique : true,
    default : function(){
      const namePart = this.name.toLowerCase().split(' ');
      const emailPart = this.email.toLowerCase().split('@')[0];
      return `${namePart.join('_')}_${emailPart}`;
    }
  },
  shift:{
    type : String,
    enum: ['Morning' , 'Afternoon' , 'Evening', 'Night']
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
  qualification: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'Doctor', 'Nurse', 'Deo', 'Fdo'],
    default: 'Nurse'
  },
  active : {
    type : Boolean,
    default : true
  },
  tests: [{
    type: Types.ObjectId,
    ref: "Test",
  }],
  appointments: [{ 
    type: Types.ObjectId, 
    ref: "Appointment",
  }],
});

nurseSchema.pre(/^find/, function (next) {
  this.populate('appointments');
  this.populate({
    path: 'tests',
    populate: {
      path: 'room',
      select: 'name' 
    }
  }); 
  next();
});

nurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Nurse = mongoose.model('Nurse', nurseSchema);

export default Nurse;