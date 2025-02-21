const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profilePicture: {
    type: String,
    default: null
  },
  resume: {
    type: String,
    default: null
  },
  technicalSkills: [{
    type: String,
    trim: true
  }],
  softSkills: [{
    type: String,
    trim: true
  }],
  jobPreferences: {
    type: String,
    default: ''
  },
  resumeScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 