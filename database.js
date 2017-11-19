//Dependencies
var header = require("./header.js")
var mongo = require('mongodb').MongoClient

//Check if data already exists or not
module.exports.exists = (data) => {
    if(data.length == 0)
        return false
    else
        return true
}

//Generate a random 4-letter word
module.exports.generateRandom = () => {
    var letters = 'abcdefghijklmonpqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var random = ""

    for(var i=0;i<4;i++){
        random += letters[Math.floor(Math.random()*(letters.length-1))]
    }

    return random
}

//URL to connect to database
var url = "mongodb://heroku_lr7cwt52:249rppc7g362s1tec03kkbsku@ds127044.mlab.com:27044/heroku_lr7cwt52"

//user login functionality
module.exports.loginUser = function(data, callback){
    var error="";
    var success={};

    mongo.connect(url, function(err, db){
        if(err) throw err

        var collection = db.collection('users')

        collection.find({
            "email": data.email
        }).toArray(function(err, document){
            if(err) throw err

            if(document.length == 0 || data.password != document[0]['password']){
                error = "Invalid email or password"
                callback(error, success)
            }else{
                error = "User logged in firstname => "+document[0]['firstName']
                success = {
                    'firstName': document[0]['firstName'],
                    'lastName': document[0]['lastName'],
                    'email': document[0]['email'],
                    'links':document[0]['links']
                }
                callback(error, success)
            }
            db.close()
        })
    })

}

//user registration functionality
module.exports.registerUser = function(data, callback){
    var msg="";

    mongo.connect(url, function(err, db){
        if(err) throw err

        var collection = db.collection('users')

        collection.find({
            "email": data.email
        }).toArray(function(err, document){
            if(err) throw err

            if(document.length == 0){
                collection.insert({
                    "firstName": data.firstName,
                    "lastName": data.lastName,
                    "email": data.email,
                    "password": data.password,
                    "links":{
                        "urls": [],
                        "customlinks": [],
                        "maskedlinks": []
                    }
                }, function(err, data){
                    if(err) throw err

                    msg = "New User created"
                    callback(msg)
                    db.close()
                })
            }else{
                msg = "This E-mail is already registered";
                callback(msg)
                db.close()
            }
        })
    })
}

//user adds new link
module.exports.addNewLink = function(data, callback){

    mongo.connect(url, function(err, db){
        if(err) throw err

        var collection = db.collection('users')
        var shortUrl = "http://hurls.in/"
        shortUrl += generateRandom()
        var title = ""

        header.getTitle(data.link, function(err, result){
            title = result
            console.log(result)
            var json_data = {
                "original link": data.link,
                "short link": shortUrl,
                "title": result
            }
            if(data.mask !== undefined){
                json_data = {
                    "original link": data.link,
                    "masked link": shortUrl,
                    "title": result
                }
                collection.update(
                    {"email": data.email},
                    {
                        $push:{
                            "links.urls": {"original-url": data.link, "short-url": shortUrl, "title": title},
                            "links.maskedlinks": {"original-url": data.link, "masked-url": shortUrl, "title": title}
                        }
                    }, function(err, success){
                        if(err) throw err
                        callback(json_data)
                        db.close()
                })
                db.collection('maskedurlData').insert({
                    "original-url": data.link,
                    "masked-url": shortUrl
                }, function(err, data){
                    if(err) throw err

                    db.close()
                })

            }
            else if(Object.keys(data).length == 2){

                collection.update(
                    {"email": data.email},
                    {
                        $push:{
                            "links.urls": {"original-url": data.link, "short-url": shortUrl, "title": title}
                        }
                    }, function(err, success){
                        if(err) throw err
                        callback(json_data)
                        db.close()
                })

                db.collection('urlData').insert({
                    "original-url": data.link,
                    "short-url": shortUrl
                }, function(err, data){
                    if(err) throw err

                    db.close()
                })
            }
            else{
                json_data = {
                    "original link": data.link,
                    "short link": data.customlink,
                    "title": result
                }
                collection.update(
                    {"email": data.email},
                    {
                        $push:{
                            "links.urls": {"original-url": data.link, "short-url": data.customlink, "title": title},
                            "links.customlinks": {"original-url": data.link, "short-url": data.customlink, "title": title}
                        }
                    }, function(err, success){
                        if(err) throw err
                        callback(json_data)
                        db.close()
                })

                db.collection('urlData').insert({
                    "original-url": data.link,
                    "short-url": data.customlink
                }, function(err, data){
                    if(err) throw err

                    db.close()
                })
            }
        })
    })
}

//delete a URL
module.exports.deleteUrl = function(data, callback){
    mongo.connect(url, function(err, db){
        if(err) throw err

        var collection = db.collection('users')

        collection.update(
            {"email": data.email},
            {
                $pull:{
                    "links.urls": {"short-url": data.shortLink},
                    "links.customlinks": {"short-url": data.shortLink}
                }
            }, function(err, success){
                if(err) throw err

                callback('done')
            })
    })
}

//get all links of a user
module.exports.getUserLinks = function(data, callback){

    mongo.connect(url, function(err, db){
        if(err) throw err

        db.collection('users').find({
            "email": data.email
        }).toArray((err, result) => {
            if(err) throw err
            //console.log(result[0].links)
            callback(result[0].links)
            db.close()
        })
    })
}

function generateRandom(){
    var letters = 'abcdefghijklmonpqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var random = ""

    for(var i=0;i<4;i++){
        random += letters[Math.floor(Math.random()*(letters.length-1))]
    }

    return random
}
