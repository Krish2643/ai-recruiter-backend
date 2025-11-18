import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { ok, created } from '../utils/responses.js';

// Helper to format application response
function formatApplication(app) {
  return {
    id: app._id.toString(),
    jobTitle: app.title || app.jobTitle || '',
    companyName: app.company || app.companyName || '',
    applicationDate: app.dateApplied ? app.dateApplied.toISOString().split('T')[0] : null,
    status: app.status,
    notes: app.notes || null,
    companyLogo: app.companyLogo || null,
    location: app.location || null,
    salary: app.salary || null,
    createdAt: app.createdAt ? app.createdAt.toISOString() : null,
    updatedAt: app.updatedAt ? app.updatedAt.toISOString() : null
  };
}

export async function createApplication(req, res) {
  const { jobTitle, title, companyName, company, status = 'Applied', applicationDate, dateApplied, notes, location, salary, companyLogo } = req.body;
  
  // Support both old (title, company) and new (jobTitle, companyName) field names
  const finalTitle = jobTitle || title;
  const finalCompany = companyName || company;
  const finalDate = applicationDate || dateApplied;
  
  if (!finalTitle || !finalCompany || !finalDate)
    return res.status(400).json({ success: false, message: 'jobTitle (or title), companyName (or company), and applicationDate (or dateApplied) are required' });

  const app = await Application.create({
    user: req.user.id,
    title: finalTitle,
    company: finalCompany,
    status,
    dateApplied: new Date(finalDate),
    notes,
    location,
    salary,
    companyLogo
  });

  return created(res, formatApplication(app));
}

export async function listApplications(req, res) {
  const { 
    status, 
    search, 
    page = 1, 
    limit = 10, 
    sortBy = 'date', 
    sortOrder = 'desc' 
  } = req.query;

  const query = { user: req.user.id };
  
  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }
  
  // Search filter (search in title and company)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let sort = {};
  switch (sortBy) {
    case 'date':
      sort = { dateApplied: sortOrder === 'asc' ? 1 : -1 };
      break;
    case 'company':
      sort = { company: sortOrder === 'asc' ? 1 : -1 };
      break;
    case 'status':
      sort = { status: sortOrder === 'asc' ? 1 : -1 };
      break;
    default:
      sort = { createdAt: sortOrder === 'asc' ? 1 : -1 };
  }

  const [apps, total] = await Promise.all([
    Application.find(query).sort(sort).skip(skip).limit(limitNum),
    Application.countDocuments(query)
  ]);

  return ok(res, {
    applications: apps.map(formatApplication),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}

export async function getApplication(req, res) {
  const { id } = req.params;
  const app = await Application.findOne({ _id: id, user: req.user.id });
  
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  
  return ok(res, formatApplication(app));
}

export async function updateApplication(req, res) {
  const { id } = req.params;
  const { 
    jobTitle, 
    title, 
    companyName, 
    company, 
    status, 
    notes, 
    applicationDate, 
    dateApplied,
    location,
    salary,
    companyLogo
  } = req.body;

  // Support both old and new field names
  const updateData = {};
  if (jobTitle !== undefined || title !== undefined) updateData.title = jobTitle || title;
  if (companyName !== undefined || company !== undefined) updateData.company = companyName || company;
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (applicationDate !== undefined || dateApplied !== undefined) {
    updateData.dateApplied = new Date(applicationDate || dateApplied);
  }
  if (location !== undefined) updateData.location = location;
  if (salary !== undefined) updateData.salary = salary;
  if (companyLogo !== undefined) updateData.companyLogo = companyLogo;

  const app = await Application.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { $set: updateData },
    { new: true }
  );

  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  
  return ok(res, formatApplication(app));
}

export async function deleteApplication(req, res) {
  const { id } = req.params;
  const app = await Application.findOneAndDelete({ _id: id, user: req.user.id });
  
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  
  return ok(res, { message: 'Job application deleted successfully' });
}

export async function bulkDeleteApplications(req, res) {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'ids array is required' });
  }

  const result = await Application.deleteMany({
    _id: { $in: ids },
    user: req.user.id
  });

  return ok(res, { 
    message: `${result.deletedCount} job application(s) deleted successfully`,
    deletedCount: result.deletedCount
  });
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
