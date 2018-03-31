//Dependencies
let mongoose = require('mongoose');
let schema = require('./schema');

// Models
let Visitor = mongoose.model('Visitor', schema.visitorSchema);
let Anonymous = mongoose.model('Anonymous', schema.anonymousSchema);
let Log = mongoose.model('Log', schema.logSchema);

// Add Visitor
let addVisitor = (data, callback) => {
  let visitor = new Visitor(data);
  visitor.save((err, success) => {
    callback(err, success);
  })
}

// Add Anonymous
let addAnonymous = (data, callback) => {
  let anonymous = new Anonymous(data);
  
}

// Add Log
let addLog = (data) => {
  let log = new Log(data);
  log.save();
}

module.exports = {
  addVisitor,
  addAnonymous,
  addLog
}