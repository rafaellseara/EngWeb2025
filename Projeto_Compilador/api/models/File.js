// /api/models/FileItem.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const FileItemSchema = new Schema({
    id:           { type: String, required: true, unique: true },
    createdAt:    { type: Date,   required: true, default: Date.now },
    ownerId:      { type: String, required: true },
    author:       { type: String, required: true },
    type:         { type: String, required: true, default: 'File' },
    visibility:   { type: String, enum: ['public','friends','private'], default: 'private' },
    tags:         [{ type: String }],
    originalName: { type: String, required: true },
    size:         { type: Number, required: true },
    format:       { type: String, required: true },
    description:  { type: String }
  });
  
  FileItemSchema.index({ createdAt: -1 });
  
  module.exports = mongoose.model('File', FileItemSchema);