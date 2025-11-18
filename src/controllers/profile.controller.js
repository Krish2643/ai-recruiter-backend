import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { ok } from '../utils/responses.js';

// Helper to split fullname into first_name and last_name
function splitName(fullname) {
  if (!fullname) return { first_name: null, last_name: null };
  const parts = fullname.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: null };
  }
  const first_name = parts[0];
  const last_name = parts.slice(1).join(' ');
  return { first_name, last_name };
}

// Helper to combine first_name and last_name into fullname
function combineName(first_name, last_name) {
  if (!first_name && !last_name) return null;
  if (!first_name) return last_name;
  if (!last_name) return first_name;
  return `${first_name} ${last_name}`.trim();
}

// Helper to format user response
function formatUserResponse(user, profile) {
  const fullname = profile?.fullname || combineName(user.first_name, user.last_name) || user.name;
  const { first_name, last_name } = profile?.fullname 
    ? splitName(profile.fullname)
    : { first_name: user.first_name, last_name: user.last_name };

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    username: user.username || null,
    first_name: first_name || null,
    last_name: last_name || null,
    fullname: fullname || null,
    occupation: profile?.occupation || null,
    companyName: profile?.companyName || null,
    phone: user.phone || null,
    language: user.language || 'en',
    availability: profile?.availability || null,
    hourlyRate: profile?.hourlyRate || null,
    skills: profile?.skills || [],
    bio: profile?.bio || null,
    location: profile?.location || null,
    pic: user.pic || null
  };
}

// Helper to normalize skills array
function normalizeSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills
      .map(s => typeof s === 'string' ? s.trim() : String(s).trim())
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  }
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
  }
  return [];
}

export async function getMe(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const profile = await Profile.findOne({ user: req.user.id });
  const formattedUser = formatUserResponse(user, profile);

  return ok(res, formattedUser);
}

export async function updateMe(req, res) {
  const {
    fullname,
    occupation,
    companyName,
    phone,
    email,
    username,
    language,
    availability,
    hourlyRate,
    skills,
    bio,
    location,
    first_name,
    last_name
  } = req.body;

  // Get current user and profile
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let profile = await Profile.findOne({ user: req.user.id });

  // Prepare user update data
  const userUpdate = {};
  if (email !== undefined) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Validation error: email must be a valid email address' });
    }
    // Check if email already exists (excluding current user)
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      userUpdate.email = email.toLowerCase();
    } else {
      return res.status(400).json({ success: false, message: 'Email cannot be empty' });
    }
  }
  if (username !== undefined) {
    // Check if username already exists (excluding current user)
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Username already exists' });
      }
    }
    userUpdate.username = username || null;
  }
  if (phone !== undefined) userUpdate.phone = phone || null;
  if (language !== undefined) userUpdate.language = language || 'en';
  if (req.body.pic !== undefined) userUpdate.pic = req.body.pic || null;

  // Handle name updates
  if (fullname !== undefined) {
    const { first_name: fn, last_name: ln } = splitName(fullname);
    userUpdate.first_name = fn;
    userUpdate.last_name = ln;
    // Also update the name field for backward compatibility
    userUpdate.name = fullname || user.name;
  } else if (first_name !== undefined || last_name !== undefined) {
    const newFirst = first_name !== undefined ? first_name : user.first_name;
    const newLast = last_name !== undefined ? last_name : user.last_name;
    userUpdate.first_name = newFirst || null;
    userUpdate.last_name = newLast || null;
    userUpdate.name = combineName(newFirst, newLast) || user.name;
  }

  // Update user
  if (Object.keys(userUpdate).length > 0) {
    Object.assign(user, userUpdate);
    await user.save();
  }

  // Prepare profile update data
  const profileUpdate = {};
  if (fullname !== undefined) profileUpdate.fullname = fullname || null;
  if (occupation !== undefined) profileUpdate.occupation = occupation || null;
  if (companyName !== undefined) profileUpdate.companyName = companyName || null;
  if (availability !== undefined) profileUpdate.availability = availability || null;
  if (hourlyRate !== undefined) profileUpdate.hourlyRate = hourlyRate || null;
  if (bio !== undefined) profileUpdate.bio = bio || null;
  if (location !== undefined) profileUpdate.location = location || null;
  if (skills !== undefined) profileUpdate.skills = normalizeSkills(skills);
  if (req.body.education !== undefined) profileUpdate.education = req.body.education || null;

  // Update or create profile
  if (Object.keys(profileUpdate).length > 0) {
    if (profile) {
      Object.assign(profile, profileUpdate);
      await profile.save();
    } else {
      profile = await Profile.create({
        user: user._id,
        ...profileUpdate
      });
    }
  }

  // Reload user to get updated data
  const updatedUser = await User.findById(req.user.id);
  const updatedProfile = await Profile.findOne({ user: req.user.id });

  const formattedUser = formatUserResponse(updatedUser, updatedProfile);

  return ok(res, formattedUser);
}
