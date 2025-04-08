import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const patientSchema = new mongoose.Schema({
  pname: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  page: {
    type: Number,
  },
  paddr: { type: String },
  p_phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  p_email:{
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  p_userName :{
    type : String,
    unique : true,
    default : function(){
      // const namePart = this.pname.toLowerCase().split(' ');
      // const emailPart = this.p_email.toLowerCase().split('@')[0];
      // return `${namePart.join('_')}_${emailPart}`;
      const namePart = this.pname.toLowerCase().split(' ');
      return `${namePart}`;
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
  guardian_name: {
    type: String,
    required: [true, "Please enter university name"],
  },
  guardian_phoneNo: {
    type: String,
    required: [true, 'Please mention your latest degree'],
  },
  appointments: [{ type: Types.ObjectId, ref: "Appointment" }]
});

patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;