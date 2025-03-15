const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerClubSchema = new Schema({
    name: {
        type: String,
        require:true
    },
    logo: {
        type: String,
        require:true
    },
    Players: {
        type: [String],
        require:true
    },
});

const PlayerClub = mongoose.model('PlayerClub', playerClubSchema);
module.exports=PlayerClub