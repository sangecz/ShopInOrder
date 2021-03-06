var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('server/sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('server/sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
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
var item = require('./server/item');
var auth = require('./server/auth');

//category
app.get(MY_API + '/category', category.list);

// list
app.get(MY_API + '/list', list.list);
app.get(MY_API + '/list/:id', list.retrieve);
app.delete(MY_API + '/list/:id', list.delete);
app.delete(MY_API + '/listDeleteCrossed', list.deleteCrossed);
app.post(MY_API + '/list', list.create);
app.put(MY_API + '/list/:id', list.update);
app.put(MY_API + '/listUpdatePositions', list.updatePositions);

// layout
app.get(MY_API + '/layout', layout.list);
app.get(MY_API + '/layout/:id', layout.retrieve);
app.post(MY_API + '/layout', layout.create);
app.delete(MY_API + '/layout/:id', layout.delete);
app.delete(MY_API + '/layoutDeleteCrossed', layout.deleteCrossed);
app.put(MY_API + '/layout/:id', layout.update);
app.put(MY_API + '/layoutUpdatePositions', layout.updatePositions);

// item
app.get(MY_API + '/item', item.list);
app.get(MY_API + '/item/:id', item.retrieve);
app.get(MY_API + '/itemForList/:list_id', item.listForList);
app.post(MY_API + '/item', item.create);
app.delete(MY_API + '/item/:id', item.delete);
app.delete(MY_API + '/itemDeleteCrossed', item.deleteCrossed);
app.put(MY_API + '/item/:id', item.update);

// auth
app.post(MY_API + '/register', auth.register);
app.post(MY_API + '/login', auth.login);

// All undefined asset or api routes should return a 404
app.get('/:xyz|(/:url(api|auth|components|app|bower_components|assets)/*)', function(req, res){
    res.sendStatus(404);
});

//app.listen(myConfig.port);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(myConfig.port);
httpsServer.listen(myConfig.sslPort);

console.log('running...listening on port ' + myConfig.port);
console.log('running...listening on port ' + myConfig.sslPort);