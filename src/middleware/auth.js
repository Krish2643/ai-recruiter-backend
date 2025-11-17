import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Account inactive' });
    req.user = { id: user.id, role: user.role };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid/expired token' });
  }
}
