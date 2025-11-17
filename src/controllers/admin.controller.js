import User from '../models/User.js';
import Document from '../models/Document.js';
import Application from '../models/Application.js';
import { ok } from '../utils/responses.js';

export async function listUsers(req, res) {
  const users = await User.find().select('name email role status lastLogin createdAt');
  return ok(res, users);
}

export async function setUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'inactive'
  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('name email role status');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return ok(res, user);
}

export async function listAllApplications(req, res) {
  const apps = await Application.find().populate('user', 'name email').sort({ createdAt: -1 });
  return ok(res, apps);
}

export async function listAllDocuments(req, res) {
  const docs = await Document.find().populate('user', 'name email').sort({ uploadedAt: -1 });
  return ok(res, docs);
}

export async function stats(req, res) {
  const [userCount, appCount, activeUsers] = await Promise.all([
    User.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ status: 'active' })
  ]);

  return ok(res, {
    totals: { users: userCount, applications: appCount, activeUsers }
  });
}
