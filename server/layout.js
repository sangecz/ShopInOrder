/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var myUtils = require('./myUtils');
var request = require('request');

exports.list = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';

    var url = myConfig.parseAPI.url + '/classes/layouts';
    var options = {
        method: 'GET',
        url: url,
        headers: myConfig.parseAPI.headers
    };
    options.headers['X-Parse-Session-Token'] = token;

    function cb(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(response.statusCode).json({err: JSON.parse(response.body).error});
        }
    }
    request(options, cb);
};

exports.retrieve = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
    var id = req.params.id;

    var url = myConfig.parseAPI.url + '/classes/layouts/' + id.trim();
    var options = {
        method: 'GET',
        url: url,
        headers: myConfig.parseAPI.headers
    };
    options.headers['X-Parse-Session-Token'] = token;

    function cb(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(response.statusCode).json({err: JSON.parse(response.body).error});
        }
    }
    request(options, cb);
};

exports.delete = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
    var id = req.params.id;

    var url = myConfig.parseAPI.url + '/classes/layouts/' + id;
    var options = {
        method: 'DELETE',
        url: url,
        headers: myConfig.parseAPI.headers
    };
    options.headers['X-Parse-Session-Token'] = token;

    function cb(error, response, body) {
        if (!error && response.statusCode == 204) {
            res.status(204).json(JSON.parse(body));
        } else {
            res.status(response.statusCode).json({err: JSON.parse(response.body).error});
        }
    }
    request(options, cb);
};

exports.create = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';

    var layout = {};
    req.on('data', function(chunk) {
        var parsedChunk = JSON.parse(chunk);
        layout.name = parsedChunk.name;
        layout.desc = parsedChunk.desc == undefined ? "" :parsedChunk.desc;
        layout.position = parsedChunk.position;
        layout.categories = parsedChunk.categories;
        layout.ACL = parsedChunk.ACL;
    });

    req.on('end', function() {
        if(layout.name == undefined || layout.position == undefined
            || layout.categories == undefined || layout.ACL == undefined) {
            res.status(400).json({err: 'missing required parameter (name, position, categories, ACL)'});
        } else if(!(typeof layout.name === 'string')) {
            res.status(400).json({err: 'bad layout name'});
        } else if(!(typeof layout.desc === 'string')) {
            res.status(400).json({err: 'bad layout description'});
        } else if(!myUtils.isNumber(layout.position)) {
            res.status(400).json({err: 'bad layout position'});
        } else if(!myUtils.isArray(layout.categories)) {
            res.status(400).json({err: 'bad layout categories'});
        } else if(!(typeof layout.ACL === 'object')) {
            res.status(400).json({err: 'bad layout ACL'});
        } else {
            var options = {
                method: 'POST',
                url:  myConfig.parseAPI.url + '/classes/layouts',
                headers: myConfig.parseAPI.headers,
                body: JSON.stringify(layout)
            };
            options.headers['X-Parse-Session-Token'] = token;
            function cb(error, response, body) {
                if (!error && response.statusCode == 201) {
                    res.status(201).json(JSON.parse(body));
                } else {
                    res.status(response.statusCode).json({err: JSON.parse(response.body).error});
                }
            }
            request(options, cb);
        }
    });
};

exports.update = function(req, res){
    // TODO
    var item = {};

    req.on('data', function(chunk) {
        item = JSON.parse(chunk).item;
    });

    req.on('end', function() {
        if(item == {} ) {
            res.status(400).json({err: 'empty item'});
        } else if(!(typeof item.name === 'string')) {
            res.status(400).json({err: 'bad name'});
        } else if(!isUncategorizedIn(item)) {
            res.status(400).json({err: "missing category: 'uncategorized'"});
        } else if(hasDuplicates(item.categories)) {
            res.sendStatus(400).json({err: 'duplicate categories'});
        } else {

            res.sendStatus(204);
        }
    });
};

exports.sync = function(req, res){
    var item = {};

    req.on('data', function(chunk) {
        item = JSON.parse(chunk).item;
    });

    req.on('end', function() {
        if(item == {} ) {
            res.status(400).json({err: 'empty item'});
        } else if(!(typeof item.name === 'string')) {
            res.status(400).json({err: 'bad name'});
        } else {

            // TODO todoist

            res.sendStatus(204);
        }
    });
};

function isUncategorizedIn(item) {
    for(var i = 0; i < item.categories.length; i++){
        if(item.categories[i].id == 0){
            return true;
        }
    }
    return false;
}

function hasDuplicates(arr) {
    var i, j, n;
    n=arr.length;
    // to ensure the fewest possible comparisons
    for (i=0; i<n; i++) {                    // outer loop uses each item i at 0 through n
        for (j=i+1; j<n; j++) {              // inner loop only compares items j at i+1 to n
            if (arr[i]==arr[j]) return true;
        }	}
    return false;
}






