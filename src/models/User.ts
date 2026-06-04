import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
  },
  department: {
    type: String,
    required: false,
  },
  hasReadDisclaimer: {
    type: Boolean,
    default: false,
  },
  pushSubscriptions: [{
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  }],
  matricNumber: {
    type: String,
    required: [true, "Please provide your matric number"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
