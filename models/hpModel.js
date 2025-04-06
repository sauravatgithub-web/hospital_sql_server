import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const hpSchema = new mongoose.Schema({
  h_name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  haddr: { type: String },
  h_phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  h_email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  h_userName :{
    type : String,
    unique : true,
    default : function(){
      const namePart = this.h_name.toLowerCase().split(' ');
      const emailPart = this.h_email.toLowerCase().split('@')[0];
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
  uni: {
    type: String,
    required: [true, "Please enter university name"],
  },
  degree: {
    type: String,
    required: [true, 'Please mention your latest degree'],
  },
  supervisedBy: [{
    type: Types.ObjectId,
    ref: "Doctor"
  }],
  appointments: [{ 
      type: Types.ObjectId, 
      ref: "Appointment"
  }],
});

hpSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Hospital_Professional = mongoose.model('Hospital_Professional', hpSchema);

export default Hospital_Professional;