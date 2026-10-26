export const tenantIsolation = (req, res, next) => {
  req.tenantId = req.headers['x-tenant-id'] || 'default-campus';
  next();
};
