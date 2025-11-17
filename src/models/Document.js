import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['CV', 'CoverLetter', 'Certificate'], required: true },
    fileName: { type: String, required: true, maxlength: 255 },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true }, // bytes
    mimeType: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
