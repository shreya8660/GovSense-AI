import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiResponse.js';
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Admin from '../models/Admin.js';

const roleModelMap = { citizen: User, officer: Officer, admin: Admin };

// Verifies the Bearer token and attaches { id, role, doc } to req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const Model = roleModelMap[decoded.role];
  if (!Model) throw new ApiError(401, 'Invalid token role');

  const account = await Model.findById(decoded.id);
  if (!account || account.isActive === false) {
    throw new ApiError(401, 'Account not found or has been deactivated');
  }

  req.user = { id: account._id.toString(), role: decoded.role, doc: account };
  next();
});

// Restricts a route to specific roles. Use after `protect`.
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, `Role '${req.user?.role}' is not authorized for this action`));
  }
  next();
};

// Lets n8n (or any trusted automation) call read-only endpoints with a static
// API key, OR a normal officer/admin JWT. Used on dashboard & report GET routes
// so n8n workflows can pull stats/exports without a human login.
export const allowServiceOrRole = (...roles) => async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && process.env.N8N_API_KEY && apiKey === process.env.N8N_API_KEY) {
    req.user = { id: null, role: 'system' };
    return next();
  }
  return protect(req, res, (err) => {
    if (err) return next(err);
    return authorize(...roles)(req, res, next);
  });
};
