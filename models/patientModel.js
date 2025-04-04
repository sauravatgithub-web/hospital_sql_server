import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';

const patientSchema = new mongoose.Schema({
  pname: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  paddr: { type: String },
  p_phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  p_userName :{
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