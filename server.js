//Dependencies
var express = require('express')
var app = express()
var path = require('path')
var mongo = require('mongodb').MongoClient
var database = require('./database.js')
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")
var header = require("./header.js")

//URL to connect to database and port number
var url = 'mongodb://localhost:27017/url'
var port = process.env.PORT || 3000

//Set View engine and add static directory
app.set('view engine', 'ejs')
app.set('views', __dirname+'/views')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieParser())

//Homepage view
app.get('/', function(req, res){

    //console.log(req.cookies)
    if(req.cookies.user){
        res.render('client/dashboard', {data: req.cookies.user})
        //console.log(req.cookies.user)
    }
    else
        res.render('index')
})

//Getting-started view
app.get('/getting-started', function(req, res){
    res.render('get-started')
})

//Custom links View
app.get('/track-links', function(req, res){
  res.render('custom')
})

//About Us View
app.get('/about', function(req, res){
  res.render('aboutus')
})

var originalUrl = ""

//new url view
app.get('/new', function(req, res){
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
                    var shortUrl = "http://localhost:3000/"
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
app.post("/login", function(req, res){
    database.loginUser(req.body, function(msg, data){
        console.log(msg)
        res.send(JSON.stringify({"error": msg, "success": data}))
    })
})

//User Registration
app.post('/signup', function(req, res){
    //console.log(req.body)
    database.registerUser(req.body, function(msg){
        console.log(msg)
        res.send(msg)
    })

})

//User link add functionality
app.post('/new', function(req, res){
    console.log(req.body)
    database.addNewLink(req.body, function(msg){
        console.log(msg)
        res.send(msg)
    })
})

//Get all URL's of a User
app.post('/geturls', function(req, res){
    console.log(req.body)
    database.getUserLinks(req.body, function(data){
        res.send(data)
    })
})

//User deletes a URL
app.post('/deleteURL', function(req, res){
    console.log(req.body)
    database.deleteUrl(req.body, function(success){
        res.send(success)
    })
})

//Redirection functionality
app.get('/*', function(req, res){
    var requestedUrl = req.url
    //console.log(requestedUrl)

    mongo.connect(url, function(err, db){
        if(err)
            throw err

        db.collection("urlData").find({
            "short-url": "http://localhost:3000"+requestedUrl
        }).toArray(function(err, data){
            if(database.exists(data)){
                res.redirect(data[0]['original-url'])
            }else{
                //masking functionality
                db.collection("maskedurlData").find({
                    "masked-url": "http://localhost:3000"+requestedUrl
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
