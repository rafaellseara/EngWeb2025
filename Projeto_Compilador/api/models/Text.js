// /api/models/Text.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TextSchema = new Schema({
    id:           { type: String, required: true, unique: true },
    createdAt:    { type: Date,   required: true, default: Date.now },
    ownerId:      { type: String, required: true },
    author:       { type: String, required: true },
    type:         { type: String, required: true, default: 'Text' },
    visibility:   { type: String, enum: ['public','friends','private'], default: 'private' },
    tags:         [{ type: String }],
    title:        { type: String },
    content:      { type: String, required: true },
    summary:      { type: String }
  });
  
  TextSchema.index({ createdAt: -1 });
  TextSchema.index({ tags: 1 });
  
  module.exports = mongoose.model('Text', TextSchema);