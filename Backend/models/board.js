import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    //   unique: true, 
      trim: true,
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card', 
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Board', boardSchema);
