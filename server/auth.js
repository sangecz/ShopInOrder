/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var request = require('request');

exports.register = function(req, res){
};

exports.login = function(req, res){

    var user;
    req.on('data', function(chunk) {
        user = JSON.parse(chunk).user;
    });

    req.on('end', function() {
        if(user == {} ) {
            res.status(400).json({err: 'empty user'});
        } else {
            // TODO todoist
            request.post(
                {
                    url: 'https://todoist.com/API/v6/login',
                    form: {
                        email: user.email,
                        password: user.password
                    }
                },
                function(err, httpResponse, body){
                    if(httpResponse.statusCode == 200){
                        res.status(200).json({ token: JSON.parse(body).token});
                    } else {
                        res.status(httpResponse.statusCode).json({ err: JSON.parse(httpResponse.body).error});
                    }
                }
            );
        }
    });



};







