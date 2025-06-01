// api/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'uma_chave_super_secreta';

// Middleware para validar token e anexar req.user
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: payload.id });
    if (!user) return res.status(401).json({ error: 'Utilizador não encontrado.' });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// Middleware que tenta autenticar, mas deixa passar se não houver token
async function authenticateOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}

module.exports = { authenticate, authenticateOptional };
