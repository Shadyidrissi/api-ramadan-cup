const mongoose = require('mongoose');
const { Schema } = mongoose;

const clubSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    goal: {
        type: Number,
        default: 0
    },
    conceded: {
        type: Number,
        default: 0
    },
    win: {
        type: Number,
        default: 0
    },
    loss: {
        type: Number,
        default: 0
    },
    draw: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;