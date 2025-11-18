import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 150 }, // Keep for backward compatibility
    company: { type: String, required: true, maxlength: 150 }, // Keep for backward compatibility
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
      index: true
    },
    dateApplied: { type: Date, required: true },
    notes: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 200 },
    salary: { type: String, maxlength: 100 },
    companyLogo: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
