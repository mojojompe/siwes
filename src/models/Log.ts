import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  dayOfWeek: {
    type: String, // e.g., "Monday", "Tuesday"
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  weekNumber: {
    type: Number, // Calculate ISO week number or relative week
    required: true,
  },
  tags: [{
    type: String,
  }],
  reminder: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

// Ensure we don't have multiple logs for the same user on the same date
LogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);
