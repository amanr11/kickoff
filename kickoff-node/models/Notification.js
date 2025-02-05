const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 200
    },
    is_read: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: DateTime.now
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;