/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var myUtils = require('./myUtils');
var request = require('request');

exports.list = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';

    var url = myConfig.parseAPI.url + '/classes/lists';
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

    var url = myConfig.parseAPI.url + '/classes/lists/' + id;
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

    var url = myConfig.parseAPI.url + '/classes/lists/' + id;
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

    var list = {};
    req.on('data', function(chunk) {
        var parsedChunk = JSON.parse(chunk);
        list.name = parsedChunk.name;
        list.desc = parsedChunk.desc == undefined ? "" : parsedChunk.desc;
        list.position = parsedChunk.position;
        list.layout_id = parsedChunk.layout_id;
        list.ACL = parsedChunk.ACL;
    });

    req.on('end', function() {

        if(list.name === undefined || list.position === undefined
            || list.layout_id === undefined || list.ACL === undefined) {
            res.status(400).json({err: 'missing required parameter (name, position, layoutId, ACL)'});
        } else if(!(typeof list.name === 'string')) {
            res.status(400).json({err: 'bad list name'});
        } else if(!(typeof list.desc === 'string')) {
            res.status(400).json({err: 'bad list description'});
        } else if(!myUtils.isNumber(list.position)) {
            res.status(400).json({err: 'bad list position'});
        } else if(list.layout_id != null && !(typeof list.layout_id === 'string')) {
            res.status(400).json({err: 'bad list layoutId'});
        } else if(!(typeof list.ACL === 'object')) {
            res.status(400).json({err: 'bad list ACL'});
        } else {
            // adjustment for Parse
            list.layout_id = {
                __type: "Pointer",
                className: "layouts",
                objectId: list.layout_id
            };

            var options = {
                method: 'POST',
                url:  myConfig.parseAPI.url + '/classes/lists',
                headers: myConfig.parseAPI.headers,
                body: JSON.stringify(list)
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
        } else if(item.layoutId != '' && !(typeof parseInt(item.layoutId) === 'number')) {
            res.status(400).json({err: "Bad layout (integer id or empty string)"});
        } else {
            item.layoutId = parseInt(item.layoutId);
            // TODO todoist

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