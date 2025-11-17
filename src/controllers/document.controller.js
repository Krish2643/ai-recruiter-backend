import Document from '../models/Document.js';
import { persistUploadedFile } from '../services/storage.service.js';
import { ok, created } from '../utils/responses.js';

export async function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
  const { type = 'CV' } = req.body;

  const fileUrl = await persistUploadedFile(req.file.path);

  const doc = await Document.create({
    user: req.user.id,
    type,
    fileName: req.file.originalname,
    fileUrl,
    fileSize: req.file.size,
    mimeType: req.file.mimetype
  });

  return created(res, { fileUrl: doc.fileUrl, id: doc.id });
}

export async function listDocuments(req, res) {
  const docs = await Document.find({ user: req.user.id }).sort({ uploadedAt: -1 });
  return ok(res, docs);
}

export async function deleteDocument(req, res) {
  const { id } = req.params;
  const doc = await Document.findOneAndDelete({ _id: id, user: req.user.id });
  if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
  return ok(res, { message: 'Deleted' });
}
