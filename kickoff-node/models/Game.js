const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    host_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true,
        maxlength: 100
    },
    time: {
        type: Date,
        required: true
    },
    quality: {
        type: String,
        required: true,
        maxlength: 100
    },
    players_needed: {
        type: Number,
        required: true,
        min: 1
    },
    description: {
        type: String,
        maxlength: 500
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Game = mongoose.model('Game', GameSchema);
module.exports = Game;