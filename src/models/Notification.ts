import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["alarm", "task", "log", "system"],
    default: "system",
  },
  relatedId: {
    type: String,
    required: false,
  },
  actionLink: {
    type: String,
    required: false,
  }
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
