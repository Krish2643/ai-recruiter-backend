import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { ok } from '../utils/responses.js';

export async function getMe(req, res) {
  const user = await User.findById(req.user.id).select('name email role status');
  const profile = await Profile.findOne({ user: req.user.id });
  return ok(res, { user, profile });
}

export async function updateMe(req, res) {
  const { education, skills, bio } = req.body;
  const skillsArr = Array.isArray(skills)
    ? skills
    : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  const profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: { education, skills: skillsArr, bio } },
    { upsert: true, new: true }
  );

  return ok(res, profile);
}
