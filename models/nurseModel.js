import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const nurseSchema = new mongoose.Schema({
  n_name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  n_email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
  n_addr: { type: String },
  n_phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  n_userName :{
    type : String,
    unique : true,
    default : function(){
      const namePart = this.hname.toLowerCase().split(' ');
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
  role: {
    type: String,
    enum: ['admin', 'Doctor', 'Nurse', 'Deo', 'Fdo'],
    default: 'Nurse'
  }
});

nurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Nurse = mongoose.model('Nurse', nurseSchema);

export default Nurse;