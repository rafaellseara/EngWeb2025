// 1. Cria o modelo de Comment (api/models/Comment.js)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['Photo', 'Text', 'AcademicResult', 'SportResult', 'File', 'Event'],
  },
  resourceId: {
    type: String,
    required: true, // o “id” do recurso comentado
  },
  author: {
    type: String,
    required: true, // username do autor do comentário
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
