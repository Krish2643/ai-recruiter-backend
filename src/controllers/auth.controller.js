import User from '../models/User.js';
import { signJWT } from '../utils/crypto.js';
import { ok } from '../utils/responses.js';

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'name, email, password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password, role: 'candidate' });
  const token = signJWT(user);
  return res.status(201).json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role } } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'email, password required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (user.status === 'inactive')
    return res.status(403).json({ success: false, message: 'Account inactive' });

  user.lastLogin = new Date();
  await user.save();

  const token = signJWT(user);
  return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role } } });
}

export async function getCurrentUser(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  return ok(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}
