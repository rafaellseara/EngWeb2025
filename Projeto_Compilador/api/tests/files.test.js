// tests/files.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app, mongod, jwtToken, userId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongod.getUri();
  app = require('../app');
  await mongoose.connect(process.env.MONGO_URL);

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email:    'testuser@example.com',
      password: 'testpass'
    })
    .expect(201);

  jwtToken = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Files API (com auth)', () => {
  let createdId;

  it('POST  /api/files → deve criar um ficheiro', async () => {
    const res = await request(app)
      .post('/api/files')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        id:           '55555555-5555-5555-8555-555555555555',
        originalName: 'doc.pdf',
        size:         12345,
        format:       'pdf',
        description:  'Test doc',
        tags:         ['work'],
        visibility:   'friends'
      })
      .expect(201);

    expect(res.body).toHaveProperty('originalName', 'doc.pdf');
    expect(res.body).toHaveProperty('ownerId', userId);
    createdId = res.body.id;
  });

  it('GET   /api/files (sem auth) → só vê public', async () => {
    const res = await request(app)
      .get('/api/files')
      .expect(200);
    expect(res.body.length).toBe(0);
  });

  it('GET   /api/files (com auth) → vê a própria friends', async () => {
    const res = await request(app)
      .get('/api/files')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body.find(f => f.id === createdId)).toBeDefined();
  });

  it('GET   /api/files/:id → retornar friends/public com auth', async () => {
    // Sem auth: 403 (não é public)
    await request(app)
      .get(`/api/files/${createdId}`)
      .expect(403);

    // Com auth como owner, mas sem amigos (visibility "friends") → 403
    await request(app)
      .get(`/api/files/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(403);
  });

  it('PUT   /api/files/:id → atualizar (só owner)', async () => {
    const res = await request(app)
      .put(`/api/files/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ description: 'Updated doc' })
      .expect(200);
    expect(res.body).toHaveProperty('description', 'Updated doc');
  });

  it('DELETE /api/files/:id → apagar (só owner)', async () => {
    await request(app)
      .delete(`/api/files/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    await request(app)
      .get(`/api/files/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
