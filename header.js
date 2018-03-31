var request = require("request");
var cheerio = require("cheerio");

//Get title of each page
module.exports.getTitle = function(url, callback){
    request(url, function(err, res, body){
        if(!err && res.statusCode == 200){
            var $ = cheerio.load(body)
            var title =$("title").text()
            callback(err, title)
            console.log(title)
        }
    })
}

//Mask page
module.exports.getBody = function(url, callback){
    request(url, function(err, res, body){
        if(!err && res.statusCode == 200){
            var $ = cheerio.load(body)
            //var title =$("title").text()
            callback($)
            //console.log(title)
        }
    })
}
