const bcrypt = require('bcrypt');
const validator = require('validator');

const UserSchema = require('../Schemas/UserSchema');

let User = class {
    username;
    email;
    password;
    phoneNumber;
    name;
    profilepic;

    constructor({username, name, email, password, phoneNumber, profilepic}) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.profilepic = profilepic;
    }

    static verifyUsernameAndEmailExists({username, email}) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await UserSchema.findOne({$or: [{username}, {email}]});

                if(!user) 
                    return resolve();

                if(user && user.email === email) {
                    return reject("User with email already exists");
                }

                if(user && user.username === username) {
                    return reject("User with username already exists");
                }

                return reject('Some unknown error occured');                
            }
            catch(err) {
                return reject(err);
            }
        })
    }

    registerUser() {
        return new Promise(async (resolve, reject) => {

            const hashedPassword = await bcrypt.hash(this.password, 13);

            const user = new UserSchema({
                username: this.username,
                email: this.email,
                password: hashedPassword,
                phoneNumber: this.phoneNumber,
                profilePic: this.profilepic,
                name: this.name
            })

            try {
                const dbUser = await user.save();

                return resolve(dbUser);
            }
            catch(err) {
                return reject(err);
            }

        })
    }
    
    static findUserWithLoginId(loginId) {
        return new Promise(async (resolve, reject) => {

            let dbUser;

            try {
                if(validator.isEmail(loginId)) {
                    dbUser = await UserSchema.findOne({email: loginId});
                }
                else {
                    dbUser = await UserSchema.findOne({username: loginId});
                }
            }
            catch(err) {
                return reject("Database error");
            }            

            if(!dbUser) {
                return reject("No user found");
            }

            resolve(dbUser);
        })
    } 
}

module.exports = User;