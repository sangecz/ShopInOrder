var express = require('express');
var app = express();
var path = require('path');
var request = require('request');

var myConfig = require('./server/config');
var MY_API = '/api/' + myConfig.version;

// modules
var category = require('./server/category');

// serve static content
app.use(express.static(path.join(__dirname, 'client')));
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "client/list/index.html" );
});

app.get(MY_API + '/category', category.index);


app.listen(myConfig.port);

console.log('running...listening on port ' + myConfig.port);