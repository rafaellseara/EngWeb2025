const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid').v4;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'uma_chave_super_secreta';

// REGISTO: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validação básica
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email e password são obrigatórios.' });
    }
    
    // Verifica duplicados
    const exists = await User.findOne({ $or: [ { email }, { username } ] });
    if (exists) {
      return res.status(400).json({ error: 'Username ou email já existe.' });
    }

    // Cria o novo utilizador (passwordHash é gerado no pre-save)
    const newUser = new User({
      id: uuidv4(),
      username,
      email,
      passwordHash: password
    });
    await newUser.save();

    // Gera token JWT (opcional: inclui só id e username)
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ user: { id: newUser.id, username: newUser.username, email: newUser.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registar utilizador.' });
  }
});

// LOGIN: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'emailOrUsername e password são obrigatórios.' });
    }

    // Procura pelo email ou pelo username
    const user = await User.findOne({
      $or: [ { email: emailOrUsername }, { username: emailOrUsername } ]
    });
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    // Verifica a password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    // Gera token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login.' });
  }
});

// LOGIN com Google: POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email é obrigatório.' });
    }

    // Procura pelo email ou pelo username
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    // Gera token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login.' });
  }
});

module.exports = router;
