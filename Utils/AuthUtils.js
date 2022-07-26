const validator = require('validator');

function cleanUpAndValidate({email, username, phoneNumber, password}) {
    return new Promise((resolve, reject) => {
        console.log("hello cleanup");
        if(typeof(email) !== "string") {
            return reject("Email is not string");
        }

        if(!validator.isEmail(email)) {
            return reject("Invalid Email");
        }   

        if(username.length < 3) {
            return reject("Username too short");
        }

        if(username.length > 30) {
            return reject("Username too long");
        }

        if(phoneNumber && phoneNumber.length !== 10) {
            return reject("Phone number not valid");
        }

        if(password && password < 6) {
            return reject("Password too short");
        }

        return resolve();
    });
}

module.exports = { cleanUpAndValidate };