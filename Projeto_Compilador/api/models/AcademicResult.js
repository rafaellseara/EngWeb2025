// /api/models/AcademicResult.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AcademicResultSchema = new Schema({
    id:              { type: String, required: true, unique: true },
    createdAt:       { type: Date,   required: true, default: Date.now },
    ownerId:      { type: String, required: true },
    author:          { type: String, required: true },
    type:            { type: String, required: true, default: 'AcademicResult' },
    visibility:      { type: String, enum: ['public','friends','private'], default: 'private' },
    tags:            [{ type: String }],
    institution:     { type: String, required: true },
    course:          { type: String, required: true },
    grade:           { type: String, required: true },
    scale:           { type: String, required: true },
    evaluationDate:  { type: Date,   required: true }
  });
  
  AcademicResultSchema.index({ createdAt: -1 });
  AcademicResultSchema.index({ institution: 1 });
  
  module.exports = mongoose.model('AcademicResult', AcademicResultSchema);
  