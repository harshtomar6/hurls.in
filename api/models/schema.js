//Dependencies
let mongoose = require('mongoose');

// Visitor Schema
let visitorSchema = mongoose.Schema({
  ip: {type: String, required: true},
  timestamp: {type: Date, default: Date.now()},
  useragent: {type: String, required: true},
  page: {type: String, required: true}
});

// Anonymous Schema
let anonymousSchema = mongoose.Schema({
  ip: {type: String, required: true},
  timestamp: {type: Date, default: Date.now()},
  os: {type: String, required: true},
  client: {type: String, required: true},
  serviceProvider: {type: String, required: true},
  originalUrl: {type: String, required: true},
  originalUrlHeader: {type: String, required: true},
  shortUrl: {type: String, required: true},
});

// Log Schema
let logSchema = mongoose.Schema({
  message: {type: String, required: true},
  timestamp: {type: Date, default: Date.now()}
})

module.exports = {
  visitorSchema,
  anonymousSchema,
  logSchema
}