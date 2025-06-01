// api/routes/sportResults.js
const express = require('express');
const router = express.Router();
const SportResult = require('../models/SportResult');
const User = require('../models/User');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Listar resultados desportivos
// GET /api/sportResults
router.get('/', authenticateOptional, async (req, res) => {
  const { page = 1, limit = 20, activity, author } = req.query;
  const filter = {};

  if (!req.user) {
    filter.visibility = 'public';
  } else {
    filter.$or = [
      { visibility: 'public' },
      { ownerId: req.user.id },
      { $and: [{ visibility: 'friends' }, { ownerId: { $in: req.user.friends || [] } }] }
    ];
  }
  if (activity) filter.activity = activity;
  if (author) filter.author = author;

  try {
    const items = await SportResult.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar resultado desportivo (só autenticados)
// POST /api/sportResults
router.post('/', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      ownerId: req.user.id,
      author: req.user.username
    };
    const item = await SportResult.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obter resultado por ID com verificação de visibilidade
// GET /api/sportResults/:id
router.get('/:id', authenticateOptional, async (req, res) => {
  try {
    const item = await SportResult.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const { visibility, ownerId } = item;
    if (visibility === 'public') {
      return res.json(item);
    }
    if (!req.user) {
      return res.status(403).json({ error: 'Requer autenticação para ver este recurso.' });
    }
    if (visibility === 'private' && ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    if (visibility === 'friends') {
      const owner = await User.findOne({ id: ownerId });
      if (!owner || !(owner.friends || []).includes(req.user.id)) {
        return res.status(403).json({ error: 'Acesso apenas para amigos.' });
      }
    }
    return res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar resultado desportivo (apenas owner)
// PUT /api/sportResults/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await SportResult.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode atualizar.' });
    }
    const updates = { ...req.body };
    delete updates.ownerId;
    const updated = await SportResult.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar resultado desportivo (apenas owner)
// DELETE /api/sportResults/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await SportResult.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode eliminar.' });
    }
    await SportResult.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
