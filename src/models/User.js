import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastLogin: { type: Date },
    username: { type: String, unique: true, sparse: true, maxlength: 50 },
    first_name: { type: String, maxlength: 50 },
    last_name: { type: String, maxlength: 50 },
    phone: { type: String, maxlength: 20 },
    language: { type: String, maxlength: 10, default: 'en' },
    pic: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
