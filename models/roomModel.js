import mongoose, { Types } from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String },
  type : {
    type: String,
    enum: ["Consultation", "ICU", "General Ward", "Test Room"],
    default: "Consultation",
  },
  capacity : {type : Number},
  isAC : {type : Boolean},
  vacancy: { 
    type: Number, 
    default : function() {
      return this.capacity;
    }
  },
  active : {
    type : Boolean,
    default : true
  },
  bed: [{
    name: { type: String, required: true },
    isOccupied: { type: Boolean, default: false }
  }],
  appointment: [{type: Types.ObjectId, ref: "Appointment" }],
  tests: [{ type: Types.ObjectId, ref: "Test" }],
  doctor: { type: Types.ObjectId, ref: "Doctor" },
});

roomSchema.pre('save', function (next) {
  if (!this.bed || this.bed.length === 0) {
    this.bed = Array.from({ length: this.capacity }, (_, i) => ({
      name: `Bed-${i + 1}`,
      isOccupied: false
    }));
  }
  next();
});

const Room= mongoose.model('Room', roomSchema);

export default Room;