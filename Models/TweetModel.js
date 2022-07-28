const { reject } = require('bcrypt/promises');
const TweetSchema = require('../Schemas/TweetSchema');
const constants = require('../constants');

const Tweet = class {
    tweetId;
    title;
    text;
    creationDatetime;
    userId;

    constructor({title, text, creationDatetime, userId, tweetId}) {
        this.title = title;
        this.text = text;
        this.creationDatetime = creationDatetime;
        this.userId = userId;
        this.tweetId = tweetId;
    }

    static countTweetsOfUser(userId) {
        return new Promise(async (resolve, reject) => {
            try{
                const count = await TweetSchema.count({userId});
                return resolve(count);
            }
            catch(err) {
                return reject(err);
            }
        })
    }

    static findTweetById(tweetId) {
        return new Promise(async (resolve, reject) => {
            try {
                const dbTweet = await TweetSchema.findOne({_id: tweetId})

                return resolve(dbTweet);
            }
            catch(err) {
                return reject(err);
            }
        })
    }

    createTweet() {
        return new Promise(async (resolve, reject) => {
            
            const tweet = new TweetSchema({
                title: this.title,
                text: this.text,
                creationDatetime: this.creationDatetime,
                userId: this.userId
            })

            try {
                const dbTweet = tweet.save();

                return resolve(dbTweet);
            }
            catch(err) {
                return reject(err);
            }
        })
    }

    updateTweet() {
        return new Promise(async (resolve, reject) => {

            const newTweetData = {};

            if(this.title) {
                newTweetData.title = this.title;
            }

            if(this.text) {
                newTweetData.text = this.text;
            }
            try {
                const dbTweet = await TweetSchema.findOneAndUpdate({_id: this.tweetId}, newTweetData);

                return resolve(dbTweet);
            }
            catch(err) {
                return reject(err);
            }

        })
    }

    deleteTweet() {
        return new Promise(async (resolve, reject) => {

            try {
                const dbTweet = await TweetSchema.findOneAndDelete({_id: this.tweetId});

                return resolve(dbTweet);
            }
            catch(err) {
                return reject(err);
            }

        })
    }

    static getRecentTweets(offset) {
        return new Promise(async (resolve, reject) => {
            try {
                const dbTweets = await TweetSchema.aggregate([
                    {$sort: {"creationDatetime": -1 } },
                    {$facet: {
                        data: [{$skip: parseInt(offset)}, {$limit: constants.TWEETLIMIT}]
                    }}
                ])
    
                return resolve(dbTweets[0].data);
            }
            catch(err) {
                return reject(err);
            }
        })  
    }
}

module.exports = Tweet;