// tests/sportResults.test.js
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

describe('SportResults API (com auth)', () => {
  let createdId;

  it('POST  /api/sportResults → deve criar um resultado desportivo', async () => {
    const res = await request(app)
      .post('/api/sportResults')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        id:           '44444444-4444-4444-8444-444444444444',
        activity:     'running',
        value:        5.2,
        unit:         'km',
        activityDate: '2025-05-05T08:00:00Z',
        tags:         ['morning'],
        visibility:   'private'
      })
      .expect(201);

    expect(res.body).toHaveProperty('activity', 'running');
    expect(res.body).toHaveProperty('ownerId', userId);
    createdId = res.body.id;
  });

  it('GET   /api/sportResults (sem auth) → só vê public', async () => {
    const res = await request(app)
      .get('/api/sportResults')
      .expect(200);
    expect(res.body.length).toBe(0);
  });

  it('GET   /api/sportResults (com auth) → vê a própria', async () => {
    const res = await request(app)
      .get('/api/sportResults')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body.find(r => r.id === createdId)).toBeDefined();
  });

  it('GET   /api/sportResults/:id → retornar private com auth', async () => {
    // Sem auth: 403
    await request(app)
      .get(`/api/sportResults/${createdId}`)
      .expect(403);

    // Com auth: 200
    const res2 = await request(app)
      .get(`/api/sportResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res2.body).toHaveProperty('id', createdId);
  });

  it('PUT   /api/sportResults/:id → atualizar (só owner)', async () => {
    const res = await request(app)
      .put(`/api/sportResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ value: 6.0 })
      .expect(200);
    expect(res.body).toHaveProperty('value', 6.0);
  });

  it('DELETE /api/sportResults/:id → apagar (só owner)', async () => {
    await request(app)
      .delete(`/api/sportResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    await request(app)
      .get(`/api/sportResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
