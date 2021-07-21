var express = require("express");
var port = process.env.PORT || 3001;
require('dotenv').config();

var myApi = require("./api/apiroute");
const logHelper = require("./utils/loghelper");


var app = express();
logHelper.init(app);


/* 
* now tell express that we want the body to be parsed for json and urlencoded strings
*/
app.use(express.json());
app.use(express.urlencoded({extended: true}));


/*
* Tell express to go to the apiRoute when it sees /API/notes in the URL
*/
app.use('/api/', myApi);



app.use(function timeLog(req, res, next) {
    var date = new Date();

    console.log(`Got request ${req.method} at time`, date.toLocaleString());
    next();
});

/*
* Now define the directory where I can serve static content
*/
app.use('/public', express.static('src/public'));

app.listen(port);
console.log("express now running on port " + port);



