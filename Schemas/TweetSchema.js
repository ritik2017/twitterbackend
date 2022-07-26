const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true  
    },
    userId: {
        type: String,
        required: true
    },
    creationDatetime: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('tweets', TweetSchema);