const express = require('express');

const { checkAuth } = require('../middleware');
const TweetModel = require('../Models/TweetModel');

const tweet = express.Router();

tweet.post('/create', async (req, res) => {
    const { title, text } = req.body;
    const userId = req.body.userId;
    const creationDatetime = new Date();

    // Check for valid parameters
    if(!title || !text || typeof(title) !== "string" || typeof(text) !== "string") {
        return res.send({
            status: 401, 
            message: "Invalid request parameters",
            error: "Missing title or body text"
        })
    }

    if(title.length > 200) {
        return res.send({
            status: 401,
             message: "Title too long. Max characters allowed is 200"
        })
    } 

    if(text.length > 1000) {
        return res.send({
            status: 401,
             message: "Body Text too long. Max characters allowed is 1000"
        })
    }

    // Check number of tweets by user

    // let tweetCount;
    // try {
    //     tweetCount = await TweetModel.countTweetsOfUser(userId);
    // }
    // catch(err) {
    //     return res.send({
    //         status: 401,
    //         message: "Database error",
    //         error: err
    //     })
    // }
    
    // if(tweetCount >= 1000) {
    //     return res.send({
    //         status: 400,
    //         message: "You have already created 1000 tweets. Please try creating new tweets after deleting your old tweets"
    //     })
    // }

    const tweet = new TweetModel({
        userId,
        title,
        text,
        creationDatetime
    })

    try {
        const dbTweet = await tweet.createTweet();

        return res.send({
            status: 200,
            message: "Tweet Created successfully",
            data: {
                tweetId: dbTweet._id,
                title: dbTweet.tweet,
                text: dbTweet.text,
                creationDatetime: dbTweet.creationDatetime,
                userId: dbTweet.userId
            }
        })
    }
    catch(err) {
        return res.send({
            status: 401,
            message: "Database error",
            error: err
        })
    }

})

tweet.post('/update', checkAuth, async (req, res) => {
    const {title, text, tweetId} = req.body;
    const userId = req.session.user.userId;

    // Check for valid data
    if(!title && !text && !tweetId) {
        return res.send({
            status: 401, 
            message: "Invalid request parameters",
            error: "Missing title or body text"
        })
    }

    if(title && title.length > 200) {
        return res.send({
            status: 401,
             message: "Title too long. Max characters allowed is 200"
        })
    } 

    if(text && text.length > 1000) {
        return res.send({
            status: 401,
             message: "Body Text too long. Max characters allowed is 1000"
        })
    }

    // Authorised to update the tweet check
    let dbTweet;
    try {
        dbTweet = await TweetModel.findTweetById(tweetId);
    }
    catch(err) {
        return res.send({
            status: 401,
            message: "Database error",
            error: err
        })
    }

    if(!dbTweet) {
        return res.send({
            status: 401,
            message: "No tweet found"
        })
    }

    if(userId.toString() !== dbTweet.userId) {
        return res.send({
            status: 403,
            message: "Unauthorised request. Tweet belongs to some other user."
        })
    }

    // Update within 30 mins

    const currentTime = Date.now();
    const creationDatetime = (new Date(dbTweet.creationDatetime)).getTime();

    const diff = (currentTime - creationDatetime)/(1000*60);

    if(diff > 30) {
        return res.send({
            status: 400,
            message: "Update unsuccessful",
            error: "Cannot update tweets after 30 mins of tweeting"
        })
    }

    // Update the tweet in db

    try {

        const tweet = new TweetModel({
            tweetId,
            title,
            text
        })

        const dbTweet = await tweet.updateTweet();

        return res.send({
            status: 200,
            message: "Update Successful",
            data: dbTweet
        })
    }
    catch(err) {
        return res.send({
            status: 401,
            message: "Database error",
            error: err
        })
    }

})

tweet.post('/delete', checkAuth, async (req, res) => {

    const { tweetId } = req.body;

    if(!tweetId) {
        return res.send({
            status: 400,
            message: "Invlaid Request"
        })
    }

    const userId = req.session.user.userId;

    let dbTweet;
    try {
        dbTweet = await TweetModel.findTweetById(tweetId);
    }
    catch(err) {
        return res.send({
            status: 401,
            message: "Database error",
            error: err
        })
    }

    if(!dbTweet) {
        return res.send({
            status: 400,
            message: "Invalid Tweet Id"
        })
    }

    if(userId.toString() !== dbTweet.userId) {
        return res.send({
            status: 403,
            message: "Unauthorised request"
        })
    }

    // Deleting the tweet
    const tweet = new TweetModel({tweetId});

    try {
        const dbTweet = await tweet.deleteTweet();

        return res.send({
            status: 200,
            message: "Tweet Deleted Successfully",
            data: dbTweet
        })
    }
    catch(err) {
        return res.send({
            status: 401,
            message: "Internal server error",
            error: err
        })
    }
})

tweet.get('/recent', async (req, res) => {

    const offset = req.query.offset || 0;

    try {
        const dbTweets = await TweetModel.getRecentTweets(offset);

        return res.send({
            status: 200,
            message: "Read successful",
            data: dbTweets
        })
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Internal server error. Please try again",
            error: err
        })
    }

})

tweet.get('/*', (req, res) => {
    res.send({
        status: 404,
        message: "Page not found"
    });
})

module.exports = tweet;