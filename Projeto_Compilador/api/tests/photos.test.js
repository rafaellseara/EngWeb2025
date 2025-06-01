// tests/photos.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app, mongod, jwtToken, userId;

beforeAll(async () => {
  // 1) Inicia MongoDB em memória
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongod.getUri();

  // 2) Importa o app e conecta ao mongoose
  app = require('../app');
  await mongoose.connect(process.env.MONGO_URL);

  // 3) Regista um utilizador e guarda token + userId
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

describe('Photos API (com auth)', () => {
  let createdId;

  it('POST  /api/photos → deve criar uma photo (auth)', async () => {
    const res = await request(app)
      .post('/api/photos')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        id:         'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        format:     'JPEG',
        tags:       ['tag1'],
        visibility: 'private'
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(res.body).toHaveProperty('ownerId', userId);
    createdId = res.body.id;
  });

  it('GET   /api/photos (sem auth) → só vê públicas', async () => {
    const res = await request(app)
      .get('/api/photos')
      .expect(200);
    // A única photo criada é private, portanto sem auth retorna vazio
    expect(res.body.length).toBe(0);
  });

  it('GET   /api/photos (com auth) → vê a própria private', async () => {
    const res = await request(app)
      .get('/api/photos')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find(p => p.id === createdId)).toBeDefined();
  });

  it('GET   /api/photos/:id → retornar private apenas com auth', async () => {
    // Sem token → 403
    await request(app)
      .get(`/api/photos/${createdId}`)
      .expect(403);

    // Com token correto → 200
    const res2 = await request(app)
      .get(`/api/photos/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(res2.body).toHaveProperty('id', createdId);
  });

  it('PUT   /api/photos/:id → deve atualizar (só owner)', async () => {
    const res = await request(app)
      .put(`/api/photos/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ caption: 'Nova legenda' })
      .expect(200);
    expect(res.body).toHaveProperty('caption', 'Nova legenda');
  });

  it('DELETE /api/photos/:id → deve apagar (só owner)', async () => {
    await request(app)
      .delete(`/api/photos/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);

    // Verifica que já não existe
    await request(app)
      .get(`/api/photos/${createdId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
