// /api/models/SportResult.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SportResultSchema = new Schema({
  id:             { type: String, required: true, unique: true },
  createdAt:      { type: Date,   required: true, default: Date.now },
  ownerId:      { type: String, required: true },
  author:         { type: String, required: true },
  type:           { type: String, required: true, default: 'SportResult' },
  visibility:     { type: String, enum: ['public','friends','private'], default: 'private' },
  tags:           [{ type: String }],
  activity:       { type: String, required: true },
  value:          { type: Schema.Types.Mixed, required: true },
  unit:           { type: String, required: true },
  location:       { type: String },
  activityDate:   { type: Date,   required: true }
});

SportResultSchema.index({ createdAt: -1 });
SportResultSchema.index({ activity: 1 });

module.exports = mongoose.model('SportResult', SportResultSchema);