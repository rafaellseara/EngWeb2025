// /api/models/EventItem.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
    id:            { type: String, required: true, unique: true },
    createdAt:     { type: Date,   required: true, default: Date.now },
    ownerId:      { type: String, required: true },
    author:        { type: String, required: true },
    type:          { type: String, required: true, default: 'Event' },
    visibility:    { type: String, enum: ['public','friends','private'], default: 'private' },
    tags:          [{ type: String }],
    title:         { type: String, required: true },
    startDate:     { type: Date,   required: true },
    endDate:       { type: Date },
    location:      { type: String },
    participants:  [{ type: String }],
    description:   { type: String },
    eventType:     { type: String }
  });
  
  EventSchema.index({ startDate: 1 });
  EventSchema.index({ title: 1 });
  
  module.exports = mongoose.model('Event', EventSchema);