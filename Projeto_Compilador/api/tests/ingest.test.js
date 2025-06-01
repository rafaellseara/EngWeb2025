// tests/ingest.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
let app, mongod, jwtToken, userId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongod.getUri();
  app = require('../app');
  await mongoose.connect(process.env.MONGO_URL);

  // Registo do user e guarda token
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

// Depois de todos os testes, limpa mongo
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Ingest API (com auth)', () => {
  const tmpDir = path.join(__dirname, 'tmp_ingest_test');
  const zipPath = path.join(tmpDir, 'sip-test.zip');

  beforeAll(async () => {
    // Cria diretório temporário
    await fs.promises.mkdir(tmpDir, { recursive: true });

    // Monta estrutura para zip: manifest-sip.json + data/hello.txt
    const manifest = {
      id:       '11111111-1111-1111-1111-111111111111',
      author:   'testuser',
      createdAt: '2025-05-06T12:00:00Z',
      items: [
        {
          type: 'File',
          path: 'hello.txt',
          metadata: {
            originalName: 'hello.txt',
            size: 12,
            format: 'txt',
            description: 'arquivo de teste'
          }
        }
      ]
    };

    // Escreve manifest-sip.json e data/hello.txt
    await fs.promises.writeFile(
      path.join(tmpDir, 'manifest-sip.json'),
      JSON.stringify(manifest)
    );
    await fs.promises.mkdir(path.join(tmpDir, 'data'), { recursive: true });
    await fs.promises.writeFile(
      path.join(tmpDir, 'data', 'hello.txt'),
      'Hello World!'
    );

    // Cria o ZIP
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => resolve());
      archive.on('error', err => reject(err));
      archive.pipe(output);
      archive.file(path.join(tmpDir, 'manifest-sip.json'), { name: 'manifest-sip.json' });
      archive.file(path.join(tmpDir, 'data', 'hello.txt'), { name: 'data/hello.txt' });
      archive.finalize();
    });
  });

  afterAll(async () => {
    // Limpa ficheiros temporários
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  });

  it('POST /api/ingest → deve ingestionar o pacote SIP', async () => {
    const res = await request(app)
      .post('/api/ingest')
      .set('Authorization', `Bearer ${jwtToken}`)
      .attach('package', zipPath)
      .expect(201);

    // Deve retornar um array com um UUID
    expect(Array.isArray(res.body.ingested)).toBe(true);
    expect(res.body.ingested.length).toBe(1);
  });
});