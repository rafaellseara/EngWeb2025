// tests/texts.test.js
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

describe('Texts API (com auth)', () => {
  let createdId;

  it('POST  /api/texts → deve criar um texto', async () => {
    const res = await request(app)
      .post('/api/texts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        id:         '22222222-2222-2222-2222-222222222222',
        title:      'Test Title',
        content:    'This is a test text',
        summary:    'Test summary',
        tags:       ['diary','personal'],
        visibility: 'public'
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', '22222222-2222-2222-2222-222222222222');
    expect(res.body).toHaveProperty('ownerId', userId);
    createdId = res.body.id;
  });

  it('GET   /api/texts (sem auth) → vê apenas public', async () => {
    const res = await request(app)
      .get('/api/texts')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.find(t => t.id === createdId)).toBeDefined();
  });

  it('GET   /api/texts/:id → retornar public sem auth', async () => {
    const res = await request(app)
      .get(`/api/texts/${createdId}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('PUT   /api/texts/:id → deve atualizar (só owner)', async () => {
    const res = await request(app)
      .put(`/api/texts/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ summary: 'Updated summary' })
      .expect(200);
    expect(res.body).toHaveProperty('summary', 'Updated summary');
  });

  it('DELETE /api/texts/:id → deve apagar (só owner)', async () => {
    await request(app)
      .delete(`/api/texts/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    await request(app)
      .get(`/api/texts/${createdId}`)
      .expect(404);
  });
});
