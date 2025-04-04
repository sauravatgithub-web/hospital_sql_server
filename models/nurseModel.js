import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';

const nurseSchema = new mongoose.Schema({
  nname: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  naddr: { type: String },
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
  }
});

nurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const Nurse = mongoose.model('Nurse', nurseSchema);

export default Nurse;