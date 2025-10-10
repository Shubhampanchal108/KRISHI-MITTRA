const mongooose = require('mongoose');

const chatHistorySchema = new mongooose.Schema({
    userId: {
        type: mongooose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const ChatHistory = mongooose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
