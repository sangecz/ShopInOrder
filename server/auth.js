/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var request = require('request');
var myUtils = require('./myUtils');

exports.register = function(req, res){

    var err = false;
    var user = {};
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            user.username = parsedChunk.username;
            user.password = parsedChunk.password;
            user.email = parsedChunk.email;
        }
    });

    req.on('end', function() {
        if(!err) {
            if (user == {}) {
                res.status(400).json({err: 'empty user'});
            } else if (user.username === '') {
                res.status(400).json({err: 'empty username'});
            } else if (user.password === '') {
                res.status(400).json({err: 'empty password'});
            } else if (user.email === '') {
                res.status(400).json({err: 'empty email'});
            } else if (!isValidEmail(user.email)) {
                res.status(400).json({err: 'invalid email'});
            } else {
                var url = myConfig.parseAPI.url + '/users';
                var options = {
                    method: 'POST',
                    url: url,
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify(user)
                };

                function cb(error, response, body) {
                    if (!error && response.statusCode == 201) {
                        var parsed = JSON.parse(body);
                        res.status(201).json({token: parsed.sessionToken, userId: parsed.objectId});
                    } else {
                        res.status(response.statusCode).json({err: JSON.parse(response.body).error});
                    }
                }

                request(options, cb);
            }
        }
    });

};

exports.login = function(req, res){

    var err = false;
    var user = {};
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            user.username = parsedChunk.username;
            user.password = parsedChunk.password;
        }

    });

    req.on('end', function() {
        if(!err) {
            if (user == {} || user.username === '' || user.password === '') {
                res.status(400).json({err: 'empty user'});
            } else if (user.username === '' || user.password === '') {
                res.status(400).json({err: 'empty email or password'});
            } else {
                var url = myConfig.parseAPI.url + '/login?username=' + user.username + '&password=' + user.password;
                var options = {
                    method: 'GET',
                    url: url,
                    headers: myConfig.parseAPI.headers
                };

                function cb(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var parsed = JSON.parse(body);
                        res.status(201).json({token: parsed.sessionToken, userId: parsed.objectId});
                    } else {
                        res.status(response.statusCode).json({err: JSON.parse(response.body).error});
                    }
                }

                request(options, cb);
            }
        }
    });
};


function isValidEmail(email){
    return !!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}


//var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
//console.log("TOK="+ token);
//options.headers['X-Parse-Session-Token'] = token;



