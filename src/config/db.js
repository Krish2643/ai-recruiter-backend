import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
// const uri = 'mongodb://localhost:27017/ai_recruiter';
  if (!uri) throw new Error('MONGO_URI missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
  