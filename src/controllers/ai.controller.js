import mongoose from 'mongoose';
import AIInteraction from '../models/AIInteraction.js';
import { getAIReply } from '../services/ai.service.js';
import { ok, created } from '../utils/responses.js';
import { randomUUID } from 'crypto';

// Helper to format message response
function formatMessage(interaction, type) {
  return {
    id: interaction._id.toString(),
    type,
    content: type === 'user' ? interaction.userQuery : interaction.aiResponse,
    timestamp: interaction.timestamp ? interaction.timestamp.toISOString() : interaction.createdAt.toISOString()
  };
}

export async function chat(req, res) {
  const { message, conversationId } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'message is required' });

  // Generate or use conversation ID
  const convId = conversationId || randomUUID();

  // Get AI reply
  const reply = await getAIReply(message);

  // Save user message and AI response
  const interaction = await AIInteraction.create({
    user: req.user.id,
    conversationId: convId,
    userQuery: message,
    aiResponse: reply,
    inputMode: 'text',
    responseMode: 'text'
  });

  return created(res, {
    messageId: interaction._id.toString(),
    response: reply,
    conversationId: convId,
    timestamp: interaction.timestamp.toISOString()
  });
}

export async function getConversations(req, res) {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get unique conversations with their latest message
  const conversations = await AIInteraction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$aiResponse' },
        lastMessageTime: { $first: '$timestamp' },
        messageCount: { $sum: 1 }
      }
    },
    { $sort: { lastMessageTime: -1 } },
    { $skip: skip },
    { $limit: limitNum }
  ]);

  // Get total count
  const totalResult = await AIInteraction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$conversationId' } },
    { $count: 'total' }
  ]);
  const total = totalResult[0]?.total || 0;

  // Get first user message for each conversation as title
  const conversationIds = conversations.map(c => c._id);
  const firstMessages = await AIInteraction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), conversationId: { $in: conversationIds } } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: '$conversationId',
        title: { $first: '$userQuery' }
      }
    }
  ]);

  const titleMap = {};
  firstMessages.forEach(msg => {
    titleMap[msg._id] = msg.title.length > 50 ? msg.title.substring(0, 50) + '...' : msg.title;
  });

  const formattedConversations = conversations.map(conv => ({
    id: conv._id,
    title: titleMap[conv._id] || 'New Conversation',
    lastMessage: conv.lastMessage || '',
    lastMessageTime: conv.lastMessageTime.toISOString(),
    messageCount: conv.messageCount
  }));

  return ok(res, {
    conversations: formattedConversations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}

export async function getConversationMessages(req, res) {
  const userId = req.user.id;
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [interactions, total] = await Promise.all([
    AIInteraction.find({ 
      user: userId, 
      conversationId 
    })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limitNum),
    AIInteraction.countDocuments({ user: userId, conversationId })
  ]);

  // Format messages (user query and AI response as separate messages)
  const messages = [];
  interactions.forEach(interaction => {
    messages.push(formatMessage(interaction, 'user'));
    if (interaction.aiResponse) {
      messages.push({
        id: `${interaction._id}_ai`,
        type: 'ai',
        content: interaction.aiResponse,
        timestamp: interaction.timestamp ? interaction.timestamp.toISOString() : interaction.createdAt.toISOString()
      });
    }
  });

  return ok(res, {
    messages,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}

export async function deleteConversation(req, res) {
  const userId = req.user.id;
  const { conversationId } = req.params;

  const result = await AIInteraction.deleteMany({
    user: userId,
    conversationId
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }

  return ok(res, { message: 'Conversation deleted successfully' });
}
