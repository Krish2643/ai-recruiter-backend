import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { ok } from '../utils/responses.js';

// Helper to get date range filter
function getDateRangeFilter(dateRange) {
  if (!dateRange || dateRange === 'all') return {};
  
  const days = parseInt(dateRange);
  if (isNaN(days)) return {};
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { dateApplied: { $gte: startDate } };
}

// Helper to get previous period filter for % change calculation
function getPreviousPeriodFilter(dateRange) {
  if (!dateRange || dateRange === 'all') return {};
  
  const days = parseInt(dateRange);
  if (isNaN(days)) return {};
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - days);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days * 2));
  
  return { dateApplied: { $gte: startDate, $lt: endDate } };
}

// Calculate percentage change
function calculateChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getProgressKPIs(req, res) {
  const userId = req.user.id;
  const { dateRange = '30', status = 'all' } = req.query;
  
  const dateFilter = getDateRangeFilter(dateRange);
  const previousDateFilter = getPreviousPeriodFilter(dateRange);
  const statusFilter = status !== 'all' ? { status } : {};
  
  const baseQuery = { user: new mongoose.Types.ObjectId(userId), ...dateFilter, ...statusFilter };
  const previousQuery = { user: new mongoose.Types.ObjectId(userId), ...previousDateFilter, ...statusFilter };

  const [current, previous] = await Promise.all([
    Application.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          interviews: { $sum: { $cond: [{ $eq: ['$status', 'Interview'] }, 1, 0] } },
          offers: { $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] } },
          rejections: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
        }
      }
    ]),
    Application.aggregate([
      { $match: previousQuery },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          interviews: { $sum: { $cond: [{ $eq: ['$status', 'Interview'] }, 1, 0] } },
          offers: { $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] } },
          rejections: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
        }
      }
    ])
  ]);

  const currentData = current[0] || { totalApplications: 0, interviews: 0, offers: 0, rejections: 0 };
  const previousData = previous[0] || { totalApplications: 0, interviews: 0, offers: 0, rejections: 0 };

  return ok(res, {
    totalApplications: currentData.totalApplications,
    totalApplicationsChange: calculateChange(currentData.totalApplications, previousData.totalApplications),
    interviewsScheduled: currentData.interviews,
    interviewsScheduledChange: calculateChange(currentData.interviews, previousData.interviews),
    offersReceived: currentData.offers,
    offersReceivedChange: calculateChange(currentData.offers, previousData.offers),
    rejections: currentData.rejections,
    rejectionsChange: calculateChange(currentData.rejections, previousData.rejections)
  });
}

export async function getProgressCharts(req, res) {
  const userId = req.user.id;
  const { dateRange = '30', status = 'all' } = req.query;
  
  const dateFilter = getDateRangeFilter(dateRange);
  const statusFilter = status !== 'all' ? { status } : {};
  const baseQuery = { user: new mongoose.Types.ObjectId(userId), ...dateFilter, ...statusFilter };

  // Applications over time
  const applicationsOverTime = await Application.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateApplied' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);

  // Status distribution
  const statusDistribution = await Application.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusDist = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  statusDistribution.forEach(item => {
    statusDist[item._id] = item.count;
  });

  // Timeline (recent status changes and applications)
  const timeline = await Application.find(baseQuery)
    .sort({ dateApplied: -1 })
    .limit(50)
    .select('_id title company status dateApplied')
    .lean();

  const timelineData = timeline.map(app => ({
    date: app.dateApplied.toISOString().split('T')[0],
    event: app.status,
    applicationId: app._id.toString(),
    jobTitle: app.title,
    companyName: app.company
  }));

  return ok(res, {
    applicationsOverTime,
    statusDistribution: statusDist,
    timeline: timelineData
  });
}

export async function getProgressActivity(req, res) {
  const userId = req.user.id;
  const { limit = 10 } = req.query;
  
  const limitNum = parseInt(limit);
  
  // Get recent applications sorted by update time
  const recentApps = await Application.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(limitNum)
    .select('_id title company status createdAt updatedAt')
    .lean();

  const activities = recentApps.map((app, index) => {
    const isNew = app.createdAt.getTime() === app.updatedAt.getTime();
    const type = isNew ? 'application_created' : 'application_updated';
    
    let description = '';
    if (isNew) {
      description = `New application: ${app.title} at ${app.company}`;
    } else {
      description = `Application updated: ${app.title} at ${app.company} - Status: ${app.status}`;
    }

    return {
      id: `activity_${app._id}_${index}`,
      type,
      applicationId: app._id.toString(),
      jobTitle: app.title,
      companyName: app.company,
      description,
      timestamp: app.updatedAt.toISOString()
    };
  });

  return ok(res, { activities });
}

