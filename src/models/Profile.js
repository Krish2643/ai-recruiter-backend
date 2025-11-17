import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    education: { type: String, maxlength: 200 },
    skills: [{ type: String, maxlength: 100 }],
    bio: { type: String, maxlength: 500 },
    cvUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
