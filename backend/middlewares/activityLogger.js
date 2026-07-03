import ActivityLog from '../models/ActivityLog.js';

const roleToModel = { citizen: 'User', officer: 'Officer', admin: 'Admin', system: 'System' };

/**
 * Fire-and-forget audit log write. Never throws - a logging failure should
 * never break the primary request.
 */
export const logActivity = (req, { action, targetType, targetId, details }) => {
  ActivityLog.create({
    actor: req.user?.id || null,
    actorModel: roleToModel[req.user?.role] || 'System',
    action,
    targetType,
    targetId,
    details,
    ipAddress: req.ip,
  }).catch((err) => console.error('Activity log write failed:', err.message));
};
