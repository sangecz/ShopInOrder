var express = require('express');
var app = express();
var path = require('path');
var request = require('request');

var myConfig = require('./server/config');
var MY_API = '/api/' + myConfig.version;



// serve static content
app.use(express.static(path.join(__dirname, 'client')));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use('/bower_components', express.static(__dirname + '/bower_components/'));
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "client/list/list.html" );
});

//---------- API
// modules
var category = require('./server/category');
var list = require('./server/list');
var layout = require('./server/layout');
var auth = require('./server/auth');

//category
app.get(MY_API + '/category', category.index);

// list
app.get(MY_API + '/list', list.index);
app.put(MY_API + '/list', list.sync);
app.put(MY_API + '/list/:id', list.update);

// layout
app.get(MY_API + '/layout', layout.index);
app.put(MY_API + '/layout', layout.sync);
app.put(MY_API + '/layout/:id', layout.update);

// auth
app.post(MY_API + '/register', auth.register);
app.post(MY_API + '/login', auth.login);

//auth
// TODO register+login

// All undefined asset or api routes should return a 404
app.get('/:xyz|(/:url(api|auth|components|app|bower_components|assets)/*)', function(req, res){
    res.sendStatus(404);
});

app.listen(myConfig.port);

console.log('running...listening on port ' + myConfig.port);