// ──────────────────────────────────────────────
// Role Middleware — restrict routes based on user role
// ──────────────────────────────────────────────

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied. Requires one of these roles: ${allowedRoles.join(', ')}`);
    }
    next();
  };
};

const adminOnly = roleCheck('admin');
const driverOnly = roleCheck('driver');
const riderOnly = roleCheck('rider');

module.exports = { roleCheck, adminOnly, driverOnly, riderOnly };
