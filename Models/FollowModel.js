const FollowSchema = require('../Schemas/FollowSchema');

function followUser({followerUserId, followingUserId}) {
    return new Promise(async (resolve, reject) => {
        try {

            const follow = new FollowSchema({
                followerUserId,
                followingUserId
            })

            const dbFollow = await follow.save();
            resolve(dbFollow);
        }
        catch(err) {
            reject(err);
        }
    })
}

function getFollowingList(followerUserId) {
    return new Promise(async (resolve, reject) => {

        try {
            const followingList = await FollowSchema.find({followerUserId});

            return resolve(followingList);
        }
        catch(err) {
            reject(err);
        }

    })
}

function getFollowerList(followingUserId) {
    return new Promise(async (resolve, reject) => {

        try {
            const followerList = await FollowSchema.find({followingUserId});

            return resolve(followerList);
        }
        catch(err) {
            reject(err);
        }

    })
}

function unfollowUser({followingUserId, followerUserId}) {
    return new Promise(async (resolve, reject) => {

        try {
            const dbUnfollow = await FollowSchema.findOneAndDelete({followerUserId, followingUserId});

            if(!dbUnfollow) {
                return reject("User does not exist");
            }
            return resolve(dbUnfollow);
        }
        catch(err) {
            reject(err);
        }

    })
}

function verifyFollowExists({followingUserId, followerUserId}) {
    return new Promise(async (resolve, reject) => {
        try {
            const dbFollow = await FollowSchema.findOne({followerUserId, followingUserId});

            resolve(dbFollow);
        }
        catch(err) {
            return reject(err);
        }
    })
}

module.exports = { followUser, getFollowingList, getFollowerList, unfollowUser, verifyFollowExists };