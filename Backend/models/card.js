import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  column: { type: String, enum: ['backlog', 'todo', 'doing', 'done'], required: true },
  team: { type: String }, 
}, { timestamps: true });

export default mongoose.model('Card', cardSchema);