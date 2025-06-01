// /api/models/Photo.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PhotoSchema = new Schema({
  id:           { type: String, required: true, unique: true },
  createdAt:    { type: Date,   required: true, default: Date.now },
  ownerId:      { type: String, required: true },
  author:       { type: String, required: true },
  type:         { type: String, required: true, default: 'Photo' },
  visibility:   { type: String, enum: ['public','friends','private'], default: 'private' },
  tags:         [{ type: String }],
  resolution:   { width: Number, height: Number },
  format:       { type: String },
  location:     { lat: Number, lon: Number, description: String },
  caption:      { type: String },
  data:         { type: Buffer, required: true },
});

PhotoSchema.index({ createdAt: -1 });
PhotoSchema.index({ tags: 1 });

module.exports = mongoose.model('Photo', PhotoSchema);