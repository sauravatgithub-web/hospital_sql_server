import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const hsSchema = new mongoose.Schema({
  s_name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  s_addr: { type: String },
  s_phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true,
  },
  s_email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  s_userName :{
    type : String,
    unique : true,
    default : function(){
      const namePart = this.s_name.toLowerCase().split(' ');
      const emailPart = this.s_email.toLowerCase().split('@')[0];
      return `${namePart.join('_')}_${emailPart}`;
    }
  },
  role: {
    type: String,
    enum: ["FDO", "DEO"],
    default: "DEO",
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
  department: {
    type: String,
    required: [true, "Please enter department"],
  },
  designation: {
    type: String,
    required: [true, 'Please mention your designation'],
  },
  shift: {
    type: String,
  },
  active : {
    type : Boolean,
    default : true
  },
  appointments: [{ 
      type: Types.ObjectId, 
      ref: "Appointment"
  }],
});

hsSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Hospital_Staff = mongoose.model('Hospital_Staff', hsSchema);

export default Hospital_Staff; 