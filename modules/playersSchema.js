const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
    name: {
        type: String,
        require:true
    },
    group: {
        type: String,
        enum: ['green', 'yellow','red'],
        require:true
    },
});

const Player = mongoose.model('Player', playerSchema);
module.exports=Player