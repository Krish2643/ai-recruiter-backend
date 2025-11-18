import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: String, index: true }, // For grouping messages
    userQuery: { type: String, required: true, maxlength: 2000 },
    aiResponse: { type: String, maxlength: 2000 },
    inputMode: { type: String, enum: ['text', 'voice'], default: 'text' },
    responseMode: { type: String, enum: ['text', 'voice'], default: 'text' },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('AIInteraction', aiInteractionSchema);
