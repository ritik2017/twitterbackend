const express = require('express');
const bcrypt = require('bcrypt');

const { cleanUpAndValidate } = require('../Utils/AuthUtils');
const UserModel = require('../Models/UserModel');

const auth = express.Router();

auth.get('/', (req, res) => {
    
    console.log('Received a request');
    res.send('auth');
})

auth.post('/register', async (req, res) => {

    const { email, username, password, name, phoneNumber, profilePic } = req.body;

    // Validate data
    cleanUpAndValidate({email, username, phoneNumber, password}).then(async () => {
        // Validate if user is already registered
        try {
            await UserModel.verifyUsernameAndEmailExists({username, email});
        }
        catch(err) {
            return res.send({
                status: 401,
                message: "Error Occured",
                error: err
            })
        }

        // Save the data in db

        const user = new UserModel( { email, username, password, name, phoneNumber, profilePic } );

        try {
            const dbUser = await user.registerUser();

            // Newletter, Welcome email

            return res.send({
                status: 200,
                message: "Registration Successfull",
                data: {
                    name: dbUser.name,
                    userId: dbUser._id,
                    email: dbUser.email,
                    username: dbUser.username
                }
            })
        }
        catch(err) {
            return res.send({
                status: 401,
                message: "Internal error",
                error: err
            })
        }

    }).catch((err) => {
        return res.send({
            status: 400,
            message: "Invalid Data",
            error: err
        })
    })
})

auth.post('/login', async (req, res) => {
    
    const { loginId, password } = req.body;

    if(!loginId || !password) {
        return res.send({
            status: 401,
            message: "Invalid Credentials"
        })
    }

    try {

        const dbUser = await UserModel.findUserWithLoginId(loginId);

        const isMatch = await bcrypt.compare(password, dbUser.password);
        
        if(!isMatch) {
            return res.send({
                status: 401,
                message: "Invalid Password"
            })
        }

        // Session based auth
        req.session.isAuth = true;
        req.session.user = {
            userId: dbUser._id,
            username: dbUser.username,
            name: dbUser.name
        }

        return res.send({
            status: 200,
            message: "Login Successful",
            data: {
                name: dbUser.name,
                userId: dbUser._id,
                email: dbUser.email,
                username: dbUser.username
            }
        })

    }
    catch(err) {
        return res.send({
            status: 401,
            message: "Erorr Occured",
            error: err
        })
    }
    
})

auth.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;

        return res.send('Logged out successfully');
    })
})

module.exports = auth;