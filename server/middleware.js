function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Nicht eingeloggt')
  next()
}

function requireAdmin(req, res, next) {
  if (!req.session.role || req.session.role !== 'admin')
    return res.status(403).send('Keine Adminrechte')
  next()
}

module.exports = { requireLogin, requireAdmin }
