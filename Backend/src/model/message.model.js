
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true
        },

        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },

        content: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ['completed', 'failed'],
            default: 'completed'
        }
    },
    {
        timestamps: true
    }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
