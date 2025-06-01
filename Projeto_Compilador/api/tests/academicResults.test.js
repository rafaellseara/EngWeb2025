// tests/academicResults.test.js
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

describe('AcademicResults API (com auth)', () => {
  let createdId;

  it('POST  /api/academicResults → deve criar um resultado académico', async () => {
    const res = await request(app)
      .post('/api/academicResults')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        id:             '33333333-3333-4333-8333-333333333333',
        institution:    'Uni Test',
        course:         'Testing 101',
        grade:          'A',
        scale:          'A-F',
        evaluationDate: '2025-05-01T00:00:00Z',
        tags:           ['exam'],
        visibility:     'private'
      })
      .expect(201);

    expect(res.body).toHaveProperty('institution', 'Uni Test');
    expect(res.body).toHaveProperty('ownerId', userId);
    createdId = res.body.id;
  });

  it('GET   /api/academicResults (sem auth) → só vê public', async () => {
    const res = await request(app)
      .get('/api/academicResults')
      .expect(200);
    // Como é private, sem auth retorna vazio
    expect(res.body.length).toBe(0);
  });

  it('GET   /api/academicResults (com auth) → vê a própria', async () => {
    const res = await request(app)
      .get('/api/academicResults')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body.find(r => r.id === createdId)).toBeDefined();
  });

  it('GET   /api/academicResults/:id → retornar private com auth', async () => {
    // Sem auth: 403
    await request(app)
      .get(`/api/academicResults/${createdId}`)
      .expect(403);

    // Com auth: 200
    const res2 = await request(app)
      .get(`/api/academicResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res2.body).toHaveProperty('id', createdId);
  });

  it('PUT   /api/academicResults/:id → atualizar (só owner)', async () => {
    const res = await request(app)
      .put(`/api/academicResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ grade: 'A+' })
      .expect(200);
    expect(res.body).toHaveProperty('grade', 'A+');
  });

  it('DELETE /api/academicResults/:id → apagar (só owner)', async () => {
    await request(app)
      .delete(`/api/academicResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    await request(app)
      .get(`/api/academicResults/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
