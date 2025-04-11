import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  age: {
    type: Number,
  },
  addr: { type: String },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  email:{
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
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
  active : {
    type : Boolean,
    default : true
  },
  appointments: [{ type: Types.ObjectId, ref: "Appointment" }]
});

patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;