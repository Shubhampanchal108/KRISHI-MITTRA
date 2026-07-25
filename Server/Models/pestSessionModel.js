const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const diagnosisSchema = new mongoose.Schema({
  symptoms: { type: String, default: "" },
  causes: { type: String, default: "" },
  organicTreatment: { type: String, default: "" },
  chemicalTreatment: { type: String, default: "" },
  preventativeMeasures: { type: String, default: "" },
  precautions: { type: String, default: "" }
});

const pestSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cropName: {
    type: String,
    default: "Unknown Crop"
  },
  diseaseName: {
    type: String,
    default: "Unknown Disease"
  },
  confidence: {
    type: Number,
    default: 0
  },
  severity: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Healthy', 'N/A'],
    default: 'N/A'
  },
  diagnosis: {
    type: diagnosisSchema,
    default: () => ({})
  },
  chatHistory: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PestSession = mongoose.model('PestSession', pestSessionSchema);

module.exports = PestSession;
