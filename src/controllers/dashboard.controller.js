import Application from '../models/Application.js';
import { ok } from '../utils/responses.js';

export async function getDashboardStats(req, res) {
  const userId = req.user.id;

  const [totalApplications, interviewsScheduled, offersReceived] = await Promise.all([
    Application.countDocuments({ user: userId }),
    Application.countDocuments({ user: userId, status: 'Interview' }),
    Application.countDocuments({ user: userId, status: 'Offer' })
  ]);

  return ok(res, {
    totalApplications,
    interviewsScheduled,
    offersReceived
  });
}

