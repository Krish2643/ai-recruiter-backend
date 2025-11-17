import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 150 },
    company: { type: String, required: true, maxlength: 150 },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
      index: true
    },
    dateApplied: { type: Date, required: true },
    notes: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
