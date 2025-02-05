const mongoose = require('mongoose');

const GamePlayerSchema = new mongoose.Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    }
});

const GamePlayer = mongoose.model('GamePlayer', GamePlayerSchema);
module.exports = GamePlayer;