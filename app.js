const express = require('express');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

const privateConstants = require('./private-constants');

// Routes Import
const AuthController = require('./Controller/AuthController');
const TweetController = require('./Controller/TweetController');

const app = express();

// Connect to database
mongoose.connect(privateConstants.MONGODBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    console.log('Connected to database');
}).catch(err => {
    console.log("Database connection failed", err);
})

// Middlewares 
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Session based auth
const store = new MongoDBSession({
    uri: privateConstants.MONGODBURI,
    collection: 'tb_sessions'
})

app.use(session({
    secret: privateConstants.SESSIONKEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.get('/', (req, res) => {
    res.send('Welcome to home page');
})

// Router
app.use('/auth', AuthController);
app.use('/tweet', TweetController);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Lisetening on Port 3000`);
})
