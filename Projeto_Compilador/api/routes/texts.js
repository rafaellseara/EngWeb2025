// api/routes/texts.js
const express = require('express');
const router = express.Router();
const Text = require('../models/Text');
const User = require('../models/User');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Listar textos com visibilidade
// GET /api/texts
router.get('/', authenticateOptional, async (req, res) => {
  const { page = 1, limit = 20, tag, author } = req.query;
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
  if (tag) filter.tags = tag;
  if (author) filter.author = author;

  try {
    const texts = await Text.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(texts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar texto (só autenticados)
// POST /api/texts
router.post('/', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      ownerId: req.user.id,
      author: req.user.username
    };
    const text = await Text.create(data);
    res.status(201).json(text);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obter texto por ID com verificação de visibilidade
// GET /api/texts/:id
router.get('/:id', authenticateOptional, async (req, res) => {
  try {
    const text = await Text.findOne({ id: req.params.id });
    if (!text) return res.status(404).json({ error: 'Not found' });

    const { visibility, ownerId } = text;
    if (visibility === 'public') {
      return res.json(text);
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
    return res.json(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar texto (apenas owner)
// PUT /api/texts/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const text = await Text.findOne({ id: req.params.id });
    if (!text) return res.status(404).json({ error: 'Not found' });
    if (text.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode atualizar.' });
    }
    const updates = { ...req.body };
    delete updates.ownerId;
    const updated = await Text.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar texto (apenas owner)
// DELETE /api/texts/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const text = await Text.findOne({ id: req.params.id });
    if (!text) return res.status(404).json({ error: 'Not found' });
    if (text.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode eliminar.' });
    }
    await Text.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;