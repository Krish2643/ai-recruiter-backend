import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    education: { type: String, maxlength: 200 },
    skills: [{ type: String, maxlength: 100 }],
    bio: { type: String, maxlength: 1000 },
    cvUrl: { type: String },
    fullname: { type: String, maxlength: 100 },
    occupation: { type: String, maxlength: 100 },
    companyName: { type: String, maxlength: 150 },
    availability: { type: String, maxlength: 100 },
    hourlyRate: { type: String, maxlength: 50 },
    location: { type: String, maxlength: 200 }
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
