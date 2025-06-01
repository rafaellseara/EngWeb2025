// api/routes/files.js
const express = require('express');
const router = express.Router();
const path = require('path');
const FileItem = require('../models/File');
const User = require('../models/User');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Listar ficheiros
// GET /api/files
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
    const items = await FileItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar ficheiro (só autenticados)
// POST /api/files
router.post('/', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      ownerId: req.user.id,
      author: req.user.username
    };
    const item = await FileItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obter ficheiro por ID com verificação de visibilidade
// GET /api/files/:id
router.get('/:id', authenticateOptional, async (req, res) => {
  try {
    const item = await FileItem.findOne({ id: req.params.id });
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

// Atualizar ficheiro (apenas owner)
// PUT /api/files/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await FileItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode atualizar.' });
    }
    const updates = { ...req.body };
    delete updates.ownerId;
    const updated = await FileItem.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar ficheiro (apenas owner)
// DELETE /api/files/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await FileItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Só o criador pode eliminar.' });
    }
    await FileItem.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download de ficheiro com controlo de visibilidade
// GET /api/files/:id/download
router.get('/:id/download', authenticateOptional, async (req, res) => {
  try {
    const item = await FileItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const { visibility, ownerId } = item;

    if (visibility === 'public') {
      // acesso permitido
    } else if (!req.user) {
      return res.status(403).json({ error: 'Requer autenticação para descarregar este ficheiro.' });
    } else if (visibility === 'private' && ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    } else if (visibility === 'friends') {
      const owner = await User.findOne({ id: ownerId });
      if (!owner || !(owner.friends || []).includes(req.user.id)) {
        return res.status(403).json({ error: 'Acesso apenas para amigos.' });
      }
    }

    const date = new Date(item.createdAt);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const base = 'files';

    const filePath = path.join(__dirname, '../storage', base, String(year), month, `${item.id}.${item.format}`);

    res.download(filePath, item.originalName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
