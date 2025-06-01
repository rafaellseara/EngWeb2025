// api/routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Listar eventos
// GET /api/events
router.get('/', authenticateOptional, async (req, res) => {
  const { page = 1, limit = 20, author } = req.query;
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
  if (author) filter.author = author;

  try {
    const items = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar evento (só autenticados)
// POST /api/events
router.post('/', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      ownerId: req.user.id,
      author: req.user.username
    };
    const item = await Event.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obter evento por ID com verificação de visibilidade
// GET /api/events/:id
router.get('/:id', authenticateOptional, async (req, res) => {
  try {
    const item = await Event.findOne({ id: req.params.id });
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

// Atualizar evento (apenas owner)
// PUT /api/events/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await Event.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode atualizar.' });
    }
    const updates = { ...req.body };
    delete updates.ownerId;
    const updated = await Event.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar evento (apenas owner)
// DELETE /api/events/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Event.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode eliminar.' });
    }
    await Event.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
