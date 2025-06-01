// api/app.js
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/openapi.yaml');
const authRouter = require('./routes/auth');
const commentsRouter = require('./routes/comments');
require('dotenv').config();

const app = express();

// (a) Conectar ao MongoDB
const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://root:1234@localhost:27017/eu_digital?authSource=admin';
mongoose
  .connect(MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// (b) JSON middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ——————————  
// (g) Monte as rotas de Comment **antes** dos routers CRUD de cada recurso
// ——————————

// Comentários de Photos
app.use(
  '/api/photos/:resourceId/comments',
  (req, res, next) => {
    req.resourceType = 'Photo';
    next();
  },
  commentsRouter
);

// Comentários de Texts
app.use(
  '/api/texts/:resourceId/comments',
  (req, res, next) => {
    req.resourceType = 'Text';
    next();
  },
  commentsRouter
);

// Comentários de AcademicResults
app.use(
  '/api/academicResults/:resourceId/comments',
  (req, res, next) => {
    req.resourceType = 'AcademicResult';
    next();
  },
  commentsRouter
);

// Comentários de SportResults
app.use(
  '/api/sportResults/:resourceId/comments',
  (req, res, next) => {
    req.resourceType = 'SportResult';
    next();
  },
  commentsRouter
);

// Comentários de Files
app.use(
  '/api/files/:resourceId/comments',
  (req, res, next) => {
    req.resourceType = 'File';
    next();
  },
  commentsRouter
);

// Comentários de Events
app.use(
  '/api/events/:resourceId/comments',
  (req, res, next) => {
    req.resourceType = 'Event';
    next();
  },
  commentsRouter
);

// (d) Rotas principais CRUD (depois dos comentários)
app.use('/api/ingest', require('./routes/ingest'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/texts', require('./routes/texts'));
app.use('/api/academicResults', require('./routes/academicResults'));
app.use('/api/sportResults', require('./routes/sportResults'));
app.use('/api/files', require('./routes/files'));
app.use('/api/events', require('./routes/events'));

// (e) Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// (f) Autenticação
app.use('/api/auth', authRouter);

module.exports = app;
