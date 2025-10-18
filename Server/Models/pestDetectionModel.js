const mongooose = require('mongoose');

const pestDetectionSchema = new mongooose.Schema({
    userId: {
        type: mongooose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    detectedPest: {
        type: String,
    },
    confidence: {
        type: Number
    },
    recommendedTreatment: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const PestDetection = mongooose.model('PestDetection', pestDetectionSchema);

module.exports = PestDetection;
