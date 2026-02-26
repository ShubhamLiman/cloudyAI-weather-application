import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  userName: { type: String, required: true },
  text: {
    type: String,
    required: true,
    maxLength: 200,
  },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);
