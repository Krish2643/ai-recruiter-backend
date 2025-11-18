import Document from '../models/Document.js';
import { persistUploadedFile } from '../services/storage.service.js';
import { ok, created } from '../utils/responses.js';
import { unlink } from 'fs/promises';
import { resolve } from 'path';

// Helper to normalize document type
function normalizeType(type) {
  const typeMap = {
    'cv': 'CV',
    'cover-letter': 'CoverLetter',
    'certificate': 'Certificate',
    'CV': 'CV',
    'CoverLetter': 'CoverLetter',
    'Certificate': 'Certificate'
  };
  return typeMap[type] || type;
}

// Helper to format document response
function formatDocument(doc) {
  // Normalize type for response (use lowercase with hyphen for frontend)
  let responseType = doc.type.toLowerCase();
  if (responseType === 'coverletter') responseType = 'cover-letter';
  
  return {
    id: doc._id.toString(),
    name: doc.name || doc.fileName,
    type: responseType,
    fileName: doc.fileName,
    uploadDate: doc.uploadedAt ? doc.uploadedAt.toISOString() : doc.createdAt.toISOString(),
    size: doc.fileSize,
    url: doc.fileUrl,
    mimeType: doc.mimeType || null
  };
}

export async function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
  
  const { type = 'CV', name } = req.body;
  const normalizedType = normalizeType(type);

  const fileUrl = await persistUploadedFile(req.file.path);

  const doc = await Document.create({
    user: req.user.id,
    type: normalizedType,
    name: name || req.file.originalname,
    fileName: req.file.originalname,
    fileUrl,
    fileSize: req.file.size,
    mimeType: req.file.mimetype
  });

  return created(res, formatDocument(doc));
}

export async function listDocuments(req, res) {
  const { type = 'all', page = 1, limit = 10 } = req.query;
  
  const query = { user: req.user.id };
  
  // Type filter
  if (type && type !== 'all') {
    const normalizedType = normalizeType(type);
    query.type = normalizedType;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [docs, total] = await Promise.all([
    Document.find(query).sort({ uploadedAt: -1 }).skip(skip).limit(limitNum),
    Document.countDocuments(query)
  ]);

  return ok(res, {
    documents: docs.map(formatDocument),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}

export async function getDocument(req, res) {
  const { id } = req.params;
  const doc = await Document.findOne({ _id: id, user: req.user.id });
  
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  
  return ok(res, formatDocument(doc));
}

export async function updateDocument(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }

  const doc = await Document.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { $set: { name } },
    { new: true }
  );

  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  
  return ok(res, formatDocument(doc));
}

export async function deleteDocument(req, res) {
  const { id } = req.params;
  const doc = await Document.findOne({ _id: id, user: req.user.id });
  
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  // Try to delete local file if it exists (for local storage)
  if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
    try {
      const filePath = resolve(doc.fileUrl.replace(/^\//, ''));
      await unlink(filePath);
    } catch (error) {
      // File might not exist or already deleted, continue
    }
  }

  await Document.findByIdAndDelete(id);
  
  return ok(res, { message: 'Document deleted successfully' });
}

export async function getDocumentStatus(req, res) {
  const userId = req.user.id;
  
  const [totalDocs, cvCount, coverLetterCount, certCount, totalSizeResult] = await Promise.all([
    Document.countDocuments({ user: userId }),
    Document.countDocuments({ user: userId, type: { $in: ['CV', 'cv'] } }),
    Document.countDocuments({ user: userId, type: { $in: ['CoverLetter', 'cover-letter'] } }),
    Document.countDocuments({ user: userId, type: { $in: ['Certificate', 'certificate'] } }),
    Document.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ])
  ]);

  const totalSize = totalSizeResult[0]?.totalSize || 0;

  return ok(res, {
    totalDocuments: totalDocs,
    cvCount,
    coverLetterCount,
    certificateCount: certCount,
    totalSize
  });
}

export async function downloadDocument(req, res) {
  const { id } = req.params;
  const doc = await Document.findOne({ _id: id, user: req.user.id });
  
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  // For Cloudinary URLs, redirect to the URL
  if (doc.fileUrl.startsWith('http')) {
    return res.redirect(doc.fileUrl);
  }

  // For local files, serve the file
  const filePath = resolve(doc.fileUrl.replace(/^\//, ''));
  return res.download(filePath, doc.fileName);
}
