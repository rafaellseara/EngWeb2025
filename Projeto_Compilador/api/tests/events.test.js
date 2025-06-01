// tests/events.test.js
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

describe('Events API (com auth)', () => {
  let createdId;

  it('POST  /api/events → deve criar um evento', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        id:           '66666666-6666-6666-8666-666666666666',
        title:        'Test Event',
        startDate:    '2025-06-01T10:00:00Z',
        endDate:      '2025-06-01T12:00:00Z',
        location:     'Rua X, 123',
        participants: ['alice','bob'],
        description:  'Event for testing',
        eventType:    'party',
        tags:         ['fun'],
        visibility:   'private'
      })
      .expect(201);

    expect(res.body).toHaveProperty('title', 'Test Event');
    expect(res.body).toHaveProperty('ownerId', userId);
    createdId = res.body.id;
  });

  it('GET   /api/events (sem auth) → só vê public', async () => {
    const res = await request(app)
      .get('/api/events')
      .expect(200);
    expect(res.body.length).toBe(0);
  });

  it('GET   /api/events (com auth) → vê a própria private', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body.find(e => e.id === createdId)).toBeDefined();
  });

  it('GET   /api/events/:id → retornar private com auth', async () => {
    // Sem auth: 403
    await request(app)
      .get(`/api/events/${createdId}`)
      .expect(403);

    // Com auth: 200
    const res2 = await request(app)
      .get(`/api/events/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res2.body).toHaveProperty('id', createdId);
  });

  it('PUT   /api/events/:id → atualizar (só owner)', async () => {
    const res = await request(app)
      .put(`/api/events/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ description: 'Updated event description' })
      .expect(200);
    expect(res.body).toHaveProperty('description', 'Updated event description');
  });

  it('DELETE /api/events/:id → apagar (só owner)', async () => {
    await request(app)
      .delete(`/api/events/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    await request(app)
      .get(`/api/events/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
