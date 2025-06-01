// api/services/ingestService.js
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { v4: uuidv4 } = require('uuid');

// Import JSON schema for SIP manifest
const manifestSchema = require('../schemas/manifest-sip.schema.json');

// Import Mongoose models
const Photo = require('../models/Photo');
const Text = require('../models/Text');
const AcademicResult = require('../models/AcademicResult');
const SportResult = require('../models/SportResult');
const FileItem = require('../models/File');
const EventItem = require('../models/Event');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(manifestSchema);

/**
 * Main entry: process a SIP ZIP package
 * @param {string} zipPath   - Path to the uploaded ZIP file
 * @param {string} ownerId   - ID do utilizador que fez upload
 * @returns {Promise<Array<string>>} - Lista de IDs dos itens criados
 */
async function processSip(zipPath, ownerId) {
  const tempDir = await unzipSip(zipPath);
  let createdIds;
  try {
    const manifest = await loadManifest(tempDir);
    validateManifest(manifest);
    createdIds = await storeItems(manifest, tempDir, ownerId);
  } finally {
    await cleanup(zipPath, tempDir);
  }
  return createdIds;
}

/**
 * Unzip the SIP package to a temporary directory
 */
async function unzipSip(zipPath) {
  const tmpDir = path.join(__dirname, '../tmp', uuidv4());
  await fs.promises.mkdir(tmpDir, { recursive: true });
  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: tmpDir }))
    .promise();
  return tmpDir;
}

/**
 * Locate and parse the manifest-sip.json
 */
async function loadManifest(dir) {
  const manifestPath = path.join(dir, 'manifest-sip.json');
  const raw = await fs.promises.readFile(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Validate the manifest object against the JSON schema
 */
function validateManifest(manifest) {
  const valid = validate(manifest);
  if (!valid) {
    const errors = validate.errors.map(e => `${e.instancePath} ${e.message}`).join(', ');
    const err = new Error(`Manifest validation failed: ${errors}`);
    err.isValidation = true;
    throw err;
  }
}

/**
 * Insert each SIP item into MongoDB, lendo imagens em buffer
 * @param {Object} manifest
 * @param {string} tempDir
 * @param {string} ownerId
 */
async function storeItems(manifest, tempDir, ownerId) {
  const created = [];

  for (const item of manifest.items) {
    const { type, path: relPath, metadata } = item;
    const src = path.join(tempDir, 'data', relPath);
    const id = uuidv4();

    // Prepare common fields, incluindo ownerId
    const doc = {
      id,
      createdAt: new Date(manifest.createdAt),
      ownerId,
      author: manifest.author,
      type,
      visibility: metadata.visibility || 'private',
      tags: metadata.tags || []
    };
    // Merge specific metadata
    Object.assign(doc, metadata);

    switch (type) {
      case 'Photo': {
        // Lê o ficheiro como Buffer
        const buffer = await fs.promises.readFile(src);
        // Determina formato (ex: 'jpeg') ou usa metadata.format
        const format = metadata.format || path.extname(relPath).substring(1);
        doc.format = format;
        doc.caption = metadata.caption || '';
        doc.data = buffer; // Campo Buffer com binário da imagem
        await Photo.create(doc);
        break;
      }
      case 'Text':
        await Text.create(doc);
        break;
      case 'AcademicResult':
        await AcademicResult.create(doc);
        break;
      case 'SportResult':
        await SportResult.create(doc);
        break;
      case 'File':
        await FileItem.create(doc);
        break;
      case 'Event':
        await EventItem.create(doc);
        break;
      default:
        console.warn(`Unknown type: ${type}`);
    }

    created.push(id);
  }

  return created;
}

/**
 * Determine storage directory based on type and date
 * (Não usado para Photo, mas mantido para compatibilidade)
 */
function determineStorageDir(type, createdAt) {
  const date = new Date(createdAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  let base;
  switch (type) {
    case 'Photo': base = 'photos'; break;
    case 'Text': base = 'texts'; break;
    case 'AcademicResult': base = 'academic_results'; break;
    case 'SportResult': base = 'sports_results'; break;
    case 'File': base = 'files'; break;
    case 'Event': base = 'events'; break;
    default: base = 'others';
  }
  return path.join(__dirname, '../storage', base, String(year), month);
}

/**
 * Cleanup temporary files and the uploaded ZIP
 */
async function cleanup(zipPath, tempDir) {
  try {
    await fs.promises.unlink(zipPath);
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

module.exports = { processSip };