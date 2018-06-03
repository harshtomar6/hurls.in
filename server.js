//Dependencies
var express = require('express');
var app = express();
var path = require('path');
let mongoose = require('mongoose');
var session = require('express-session');
const dotenv = require('dotenv');
dotenv.load();
var mongo = require('mongodb').MongoClient
var database = require('./database.js')
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")
var header = require("./header.js")
let db = require('./api/models/db');

//port number
var url = process.env.DATABASE_URI;
var port = process.env.PORT || 3000

mongoose.connect(process.env.DATABASE_URI);

//Set View engine and add static directory
app.set('view engine', 'ejs')
app.set('views', __dirname+'/views')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({ secret: 'asdasdasdawdadad213343qweqwec123', resave: true, saveUninitialized: false }))

app.use((req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress;
    let headers = req.headers['user-agent'];
    let data = {
        ip: ip,
        useragent: headers,
        page: req.url
    }

    db.addVisitor(data, (err, success) => {
        if(err)
            db.addLog({message: 'Failed to add User Activity'});
        else
            db.addLog({message: 'User Activity added'});
    })
    next();
})

//Homepage view
app.get('/', function(req, res, next){
    if(req.session.user){
        res.render('client/dashboard', {data: JSON.stringify(req.session.user)})
    }
    else{
        res.render('index')
    }
})

//Getting-started view
app.get('/getting-started', function(req, res, next){
    res.render('get-started')
})

//Custom links View
app.get('/track-links', function(req, res, next){
  res.render('custom')
})

//About Us View
app.get('/about', function(req, res, next){
  res.render('aboutus')
})

var originalUrl = ""

//new url view
app.get('/new', function(req, res, next){
    originalUrl = req.query['url']
    var json_data = {}

    //Connect to Database
    mongo.connect(url, function(err, db){
        if(err)
            throw err

        var collection = db.collection('urlData')

        //Find if the entered URL is already present or not
        collection.find({
            "original-url": originalUrl
        }).toArray((err, document) => {
            if(err)
                throw err
            else{
                if(database.exists(document)){
                    json_data = {
                        "original link": document[0]['original-url'],
                        "short link":document[0]['short-url']
                    }
                    //console.log("DATA IF = "+document)
                }else{
                    var shortUrl = "http://hurls.in/"
                    shortUrl += database.generateRandom()
                    //else insert the new URL into database
                    collection.insert({
                        "original-url": originalUrl,
                        "short-url": shortUrl,
                    }, function(err, data){
                        if(err)
                            throw err
                        console.log("data inserted "+document)
                    })
                    //Get the data
                    json_data = {
                        "original link": originalUrl,
                        "short link": shortUrl
                    }
                }
                db.close()
                //render result view
                res.render('result', {'data': json_data})
            }
        })
    })
})

//User LogIn
app.post("/login", function(req, res, next){
    database.loginUser(req.body, function(msg, data){
        console.log(msg)
        req.session.user = data;
        res.send(JSON.stringify({"error": msg, "success": data}))
    })
});

app.post('/logout', function(req, res, next){
    req.session.user = null;
    if(req.session.user)
        res.send('err');
    else
        res.send('done');
})

//User Registration
app.post('/signup', function(req, res, next){
    //console.log(req.body)
    database.registerUser(req.body, function(msg){
        console.log(msg)
        res.send(msg)
    })

})

//User link add functionality
app.post('/new', function(req, res, next){
    console.log(req.body)
    database.addNewLink(req.body, function(msg){
        console.log(msg)
        res.send(msg)
    })
})

//Get all URL's of a User
app.post('/geturls', function(req, res, next){
    console.log(req.body)
    database.getUserLinks(req.body, function(data){
        res.send(data)
    })
})

//User deletes a URL
app.post('/deleteURL', function(req, res, next){
    console.log(req.body)
    database.deleteUrl(req.body, function(success){
        res.send(success)
    })
})

//Redirection functionality
app.get('/*', function(req, res, next){
    var requestedUrl = req.url
    //console.log(requestedUrl)

    mongo.connect(process.env.DATABASE_URI, function(err, db){
        if(err)
            throw err

        db.collection("urlData").find({
            "short-url": "http://hurls.in"+requestedUrl
        }).toArray(function(err, data){
            if(database.exists(data)){
                res.redirect(data[0]['original-url'])
            }else{
                //masking functionality
                db.collection("maskedurlData").find({
                    "masked-url": "http://hurls.in"+requestedUrl
                }).toArray(function(err, data){
                    if(database.exists(data)){
                        var original_url = data[0]['original-url']
                        header.getBody(original_url, function(result){
                            res.render('mask', {data: result})
                        })

                    }else{
                        res.send("ERROR - 404")
                    }
                    db.close()
                })
            }
            db.close()
        })

    })
})

app.listen(port, () => {
    console.log("Server is LIVE at "+port)
})
