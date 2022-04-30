const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
var parseUrl = require('body-parser');
var path = require('path');
const ShoppingList = require('./models/shoppinglist');
const User = require('./models/user');

app.use(express.static('client'));
app.use(cors());
dotenv.config();


let encodeUrl = parseUrl.urlencoded({extended: false});

const dbUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.1nrdy.mongodb.net/lists?retryWrites=true&w=majority`;
//const dbUri = `mongodb://localhost:27017/lists`;

var port = process.env.PORT || 3000;

mongoose.connect(dbUri)
    .then((result) =>{
        app.listen(port);
    })
    .catch((err) => console.log('error occured'));


const store = new MongoDBSession({
    uri: dbUri,
    collection: 'listSessions'
});

app.use(session({
    secret: 'key that will sign cookie',
    resave: false,
    saveUninitialized: false,
    store: store
}));


const isAuth = (req, res, next) => {
    if(req.session.isAuth === true){
        next();
    }else{
        res.redirect("/");
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client', 'index.html'), "");
});


app.get('/css', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client', 'css', 'style.css'), "");
});

app.get('/cssmobile', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client', 'css', 'mobile.css'), "");
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client', 'register.html'), "");
});


app.get('/home', isAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client', 'home.html'), "");
});

app.get('/logout', (req, res) => {
    
    res.sendFile(path.join(__dirname, '../', 'client', 'index.html'), "");
    req.session.destroy(err => {
        if(err) throw err;
        
    })

    
})

app.post('/users', parseUrl.json(), (req, res) => {
    let userExists = false;
    User.find({username: req.body.username})
        .then(result => {
            // res.send(result);
            if (Object.keys(result).length === 0){
                
                const user = new User({
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password,10)
                });

                
                user.save().then((result2) => {
                
                res.send({
                    message: "User created successfully. Go to Login page"
                });
                
               })
               .catch((err2) => {
                   console.log(err2);
                   res.send({
                    message: "A database error occured could not create user"
                    });
               })

            }else{
                res.send({
                    message: "User already exists"
                })
            }
           
        })
        .catch(err => {
            console.log(err)
        })

      
})

app.post('/', parseUrl.json(), (req, res) => {
     const username = req.body.username;
     const passw = req.body.password;
     let dbPw = '';

     User.find({username: username})
        .then((result) => {

            // res.send(result);

           if(Object.keys(result).length === 0){
            res.send({
                message: "The user does not exist"
            })  
           }else{
                dbPw = result[0].password;
                const rst = bcrypt.compareSync(passw, dbPw);
                if (rst === true){
                    req.session.isAuth = true;
                    req.session.theUser = username;
                    res.send({
                        message: "Correct Password"
                    })
                    
                }else{
                    res.send({
                        message: "Incorrect Password"
                    })
                }
            }
            
        })
        .catch((err) => {
            console.log(err);
        })

});

app.get('/loggeduser', (req, res) =>{
    res.send({
        user: req.session.theUser
    });
});


// Get all shopping List items
app.post('/shoppinglist',parseUrl.json(), (req, res) =>{
    const username = req.body.username;
    ShoppingList.find({user: username})
        .then(result => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});


app.post('/strikeupdate', parseUrl.json(), (req, res) =>{
    username = req.body.username;
    item = req.body.item;
    strike = req.body.strike;
    ShoppingList.updateOne({item: item, user: username},
        {$set : {strike: strike}}, {upsert: false})
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});

app.post('/deleteitem', parseUrl.json(), (req, res) =>{
    username = req.body.username;
    item = req.body.item;
    ShoppingList.deleteOne({item: item, user: username})
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});

app.post('/deleteall', parseUrl.json(), (req, res) =>{
    username = req.body.username;
    ShoppingList.deleteMany({user: username})
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});

app.post('/additem', parseUrl.json(), (req, res) =>{
    username = req.body.username;
    item = req.body.item;

    const newItem = new ShoppingList({
        item: item,
        user: username,
        strike: "no"
    });

    newItem.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});