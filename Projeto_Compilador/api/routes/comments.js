// 2. Cria um router genérico para comments (api/routes/comments.js)
const express = require('express');
const router = express.Router({ mergeParams: true });
const { v4: uuidv4 } = require('uuid');
const Comment = require('../models/Comment');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Helper para verificar existência do recurso (simplesmente tenta buscar por ID em cada coleção)
const ResourceModels = {
  Photo: require('../models/Photo'),
  Text: require('../models/Text'),
  AcademicResult: require('../models/AcademicResult'),
  SportResult: require('../models/SportResult'),
  File: require('../models/File'),
  Event: require('../models/Event'),
};

// POST /api/{resourceTypePlural}/:id/comments
// Exemplo: POST /api/photos/:id/comments
router.post('/', async (req, res) => {
  const { resourceId } = req.params;
  const resourceType = req.resourceType;
  const { content } = req.body;
  const username = req.user?.username || req.body.author?.name || "Anónimo";

  // 1) Valida parâmetros
  if (!ResourceModels[resourceType]) {
    return res.status(400).json({ error: 'ResourceType inválido' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'O campo content é obrigatório.' });
  }

  // 2) Verifica se o recurso existe
  const Model = ResourceModels[resourceType];
  const resource = await Model.findOne({ id: resourceId });
  if (!resource) {
    return res.status(404).json({ error: `${resourceType} não encontrado (id=${resourceId}).` });
  }

  // 3) Cria e guarda o comentário
  const comment = new Comment({
    id: uuidv4(),
    resourceType,
    resourceId,
    author: username,
    content: content.trim(),
  });
  await comment.save();

  res.status(201).json(comment);
});

// GET /api/{resourceTypePlural}/:id/comments
// Exemplo: GET /api/photos/:id/comments
router.get('/', authenticateOptional, async (req, res) => {
  const { resourceId } = req.params;
  const resourceType = req.resourceType;

  if (!ResourceModels[resourceType]) {
    return res.status(400).json({ error: 'ResourceType inválido' });
  }

  // 1) Verifica se o recurso existe (se quiser garantir 404)
  const Model = ResourceModels[resourceType];
  const resource = await Model.findOne({ id: resourceId });
  if (!resource) {
    return res.status(404).json({ error: `${resourceType} não encontrado (id=${resourceId}).` });
  }

  // 2) Busca todos os comentários ordenados por createdAt desc
  const comments = await Comment.find({ resourceType, resourceId })
    .sort({ createdAt: -1 });

  res.json(comments);
});

module.exports = router;
