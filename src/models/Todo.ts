import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String, // YYYY-MM-DD, optional
    required: false,
  },
}, { timestamps: true });

export const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
