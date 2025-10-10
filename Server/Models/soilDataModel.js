const mongoose = require('mongoose');

const soilSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    soilType: {
        type: String,
        required: true
    },
    phLevel: {
        type: Number,
        required: true
    },
    nitrogen: {
        type: Number,
        required: true
    },
    phosphorus: {
        type: Number,
        required: true
    },
    potassium: {
        type: Number,
        required: true
    },
    organicMatter: {
        type: Number,
    },
    moisture: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const SoilData = mongoose.model('SoilData', soilSchema);

module.exports = SoilData;
