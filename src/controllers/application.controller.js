import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { ok, created } from '../utils/responses.js';

export async function createApplication(req, res) {
  const { title, company, status = 'Applied', dateApplied, notes } = req.body;
  if (!title || !company || !dateApplied)
    return res.status(400).json({ success: false, message: 'title, company, dateApplied required' });

  const app = await Application.create({
    user: req.user.id,
    title,
    company,
    status,
    dateApplied,
    notes
  });

  return created(res, { applicationId: app.id });
}

export async function listApplications(req, res) {
  const { status } = req.query;
  const q = { user: req.user.id, ...(status ? { status } : {}) };
  const apps = await Application.find(q).sort({ createdAt: -1 });
  return ok(res, apps);
}

export async function updateApplication(req, res) {
  const { id } = req.params;
  const { status, notes, title, company, dateApplied } = req.body;

  const app = await Application.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { $set: { status, notes, title, company, dateApplied } },
    { new: true }
  );

  if (!app) return res.status(404).json({ success: false, message: 'Not found' });
  return ok(res, app);
}

export async function deleteApplication(req, res) {
  const { id } = req.params;
  const app = await Application.findOneAndDelete({ _id: id, user: req.user.id });
  if (!app) return res.status(404).json({ success: false, message: 'Not found' });
  return ok(res, { message: 'Deleted' });
}

export async function getProgress(req, res) {
  const userId = req.user.id;
  const agg = await Application.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  agg.forEach(x => (counts[x._id] = x.count));

  return ok(res, {
    applications: counts.Applied + counts.Interview + counts.Offer + counts.Rejected,
    interviews: counts.Interview,
    offers: counts.Offer,
    rejections: counts.Rejected,
    chartData: Object.entries(counts).map(([label, value]) => ({ label, value }))
  });
}
