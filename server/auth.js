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
        if(user == {} || user.email === '' || user.password === '') {
            res.status(400).json({err: 'empty user'});
        } else if(user.email === '' || user.password === '') {
            res.status(400).json({err: 'empty email or password'});
        } else if(!isValidEmail(user.email)) {
            res.status(400).json({err: 'invalid email'});
        } else {
            request.post(
                {
                    url: 'https://todoist.com/API/v6/login',
                    form: {
                        email: user.email,
                        password: user.password
                    }
                },
                function(err, httpResponse, body){
                    if(err) {
                        res.status(500).json({err: err.code});
                    } else {
                        if(httpResponse.statusCode == 200){
                            res.status(200).json({token: JSON.parse(body).token});
                        } else {
                            res.status(httpResponse.statusCode).json({err: JSON.parse(httpResponse.body).error});
                        }
                    }
                }
            );
        }
    });
};

function isValidEmail(email){
    return !!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}







