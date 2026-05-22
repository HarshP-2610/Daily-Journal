import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  date: { type: String, required: true },
  topic: { type: String, required: true },
  learningDetails: { type: String, required: true },
  importantPoints: { type: String },
  queries: { type: String },
  tools: { type: String },
}, { timestamps: true });

export default mongoose.model('Entry', entrySchema);
