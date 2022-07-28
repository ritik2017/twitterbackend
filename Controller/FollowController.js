const express = require('express');

const FollowModel = require('../Models/FollowModel');
const UserModel = require('../Models/UserModel');
const { checkAuth } = require('../middleware');
const { validateMongoDbIds } = require('../Utils/CommonUtil');

const follow = express.Router();

// A follows B
// A id is followerUserId
// B id is follwingUserId

follow.post('/follow-user', checkAuth, async (req, res) => {
    const followingUserId = req.body.followingUserId;

    if(!followingUserId || !validateMongoDbIds([followingUserId])) {
        return res.send({
            status: 401,
            message: "Missing Parameters. Following user id should be valid.",
        })
    }

    const followerUserId = req.session.user.userId;

    if(followingUserId.toString() === followerUserId.toString()) {
        return res.send({
            status: 401,
            message: "Following and follower are same. You cannot follow yourself.",
        })
    }

    try {
        await UserModel.verifyUserIdExists(followingUserId);
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Internal server error",
            error: err
        })
    }

    try {
        const dbFollow = await FollowModel.verifyFollowExists({followingUserId, followerUserId});

        if(dbFollow) {
            return res.send({
                status: 401,
                message: "User already followed",
                data: dbFollow
            })
        }
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Database error",
            error: err
        })
    }

    try {
        const dbFollow = await FollowModel.followUser({followerUserId, followingUserId});

        return res.send({
            status: 200,
            message: "Follow successful",
            data: dbFollow
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

// TODO: Paginate the API
follow.get('/followinglist/:id', async (req, res) => {

    const followerUserId = req.params.id;

    if(!followerUserId || !validateMongoDbIds([followerUserId])) {
        return res.send({
            status: 401,
            message: "Missing Parameters. Following user id should be valid.",
        })
    }

    try {
        const followingList = await FollowModel.getFollowingList(followerUserId);

        return res.send({
            status: 200,
            message: "Read Successful",
            data: followingList
        })
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Interval Server error. Please try again.",
            error: err
        })
    }

})

// TODO: Paginate the API
follow.get('/followerlist/:id', async (req, res) => {

    const followingUserId = req.params.id;

    if(!followingUserId || !validateMongoDbIds([followingUserId])) {
        return res.send({
            status: 401,
            message: "Missing Parameters. Following user id should be valid.",
        })
    }

    try {
        const followerList = await FollowModel.getFollowerList(followingUserId);

        return res.send({
            status: 200,
            message: "Read Successful",
            data: followerList
        })
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Interval Server error. Please try again.",
            error: err
        })
    }

})

follow.post('/unfollow-user', checkAuth, async (req, res) => {

    const followerUserId = req.session.user.userId;
    const followingUserId =  req.body.followingUserId;

    if(!followingUserId || !validateMongoDbIds([followingUserId])) {
        return res.send({
            status: 401,
            message: "Missing Parameters. Following user id should be valid.",
        })
    }

    try {
        await UserModel.verifyUserIdExists(followingUserId);
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Internal server error",
            error: err
        })
    }

    try {
        const dbFollow = await FollowModel.verifyFollowExists({followingUserId, followerUserId});

        if(!dbFollow) {
            return res.send({
                status: 401,
                message: "You do not follow this user"
            })
        }
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Database error",
            error: err
        })
    }

    try {
        const dbUnfollow = await FollowModel.unfollowUser({followerUserId, followingUserId});

        return res.send({
            status: 200,
            message: "Unfollow Successful",
            data: dbUnfollow
        })
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Interval Server error. Please try again.",
            error: err
        })
    }
})

module.exports = follow;