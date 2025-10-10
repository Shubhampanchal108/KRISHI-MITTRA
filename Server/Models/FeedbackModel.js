const monsgoose = require('mongoose');

const feedbackSchema = new monsgoose.Schema({
    userId: {
        type: monsgoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = monsgoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
