const mongoose = require('mongoose');
const { Schema } = mongoose;

const matchSchema = new Schema({
    clubA: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Club'
    },
    clubB: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Club'
    },
    logoA: {
        type: String,
        required: true
    },
    logoB: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    stadium: {
        type: String,
        required: true
    },
    scoreA: {
        type: Number,
        default: 0
    },
    scoreB: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
