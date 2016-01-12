/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var myUtils = require('./myUtils');
var request = require('request');

exports.list = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';

    var url = myConfig.parseAPI.url + '/classes/lists?order=position';
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

    var url = myConfig.parseAPI.url + '/classes/lists/' + id.trim();
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

exports.deleteCrossed = function(req, res){
    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
    var id = req.params.id;

    var err = false;
    var lists = [];
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            lists = JSON.parse(chunk);
        }
    });

    req.on('end', function() {
        if(!err) {
            var listsUpdated = [];
            for(var i = 0; i < lists.length && !err; i++) {
                var list = lists[i];
                if(list.objectId == undefined ){
                    err = true;
                    res.status(400).json({err: 'list objectId missing.'});
                } else {
                    var listUpdated = {
                        method : 'DELETE',
                        path : myConfig.parseAPI.version + '/classes/lists/' + list.objectId.trim()
                    };
                    listsUpdated.push(listUpdated);
                }
                if(err) {
                    break;
                }
            }
            if(!err) {
                var options = {
                    method: 'POST',
                    url: myConfig.parseAPI.url + '/batch',
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify({ requests: listsUpdated })
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
            }
        }
    });
};

exports.create = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';

    var list = {};
    var err = false;
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            list.name = parsedChunk.name;
            list.desc = parsedChunk.desc == undefined ? "" : parsedChunk.desc;
            list.position = parsedChunk.position;
            list.layout_id = parsedChunk.layout_id;
            list.ACL = parsedChunk.ACL;
            list.crossed = parsedChunk.crossed;
        }
    });

    req.on('end', function() {

        if(!err) {
            if (list.name === undefined || list.position === undefined
                || list.layout_id === undefined || list.ACL === undefined || list.crossed == undefined) {
                res.status(400).json({err: 'missing required parameter (name, position, layout_id, ACL, crossed)'});
            } else if (!(typeof list.name === 'string')) {
                res.status(400).json({err: 'bad list name'});
            } else if (!(typeof list.desc === 'string')) {
                res.status(400).json({err: 'bad list description'});
            } else if (!myUtils.isNumber(list.position)) {
                res.status(400).json({err: 'bad list position'});
            } else if (!(typeof list.ACL === 'object')) {
                res.status(400).json({err: 'bad list ACL'});
            } else if (!(typeof list.layout_id === 'object')) {
                res.status(400).json({err: 'bad list layout_id'});
            } else if (!(typeof list.crossed === 'boolean')) {
                res.status(400).json({err: 'bad list crossed'});
            } else {

                var options = {
                    method: 'POST',
                    url: myConfig.parseAPI.url + '/classes/lists',
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
        }
    });
};

exports.update = function(req, res){
    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
    var id = req.params.id;

    var err = false;
    var list = {};
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            list.name = parsedChunk.name;
            list.desc = parsedChunk.desc;
            list.position = parsedChunk.position;
            list.layout_id = parsedChunk.layout_id;
            list.ACL = parsedChunk.ACL;
            list.crossed = parsedChunk.crossed;
        }

    });

    req.on('end', function() {

        if(!err) {
            var listUpdated = getValidatedList(list, res);
            if(listUpdated != false) {  // !=error occured
                var options = {
                    method: 'PUT',
                    url: myConfig.parseAPI.url + '/classes/lists/' + id.trim(),
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify(listUpdated)
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
            }
        }
    });
};

exports.updatePositions = function(req, res){
    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
    var id = req.params.id;

    var err = false;
    var lists = [];
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            lists = JSON.parse(chunk);
        }
    });

    req.on('end', function() {
        if(!err) {
            var listsUpdated = [];
            for(var i = 0; i < lists.length && !err; i++) {
                var list = lists[i];
                if(list.objectId == undefined || list.position == undefined){
                    err = true;
                    res.status(400).json({err: 'list objectId or position missing.'});
                } else {
                    var listUpdated = {
                        method : 'PUT',
                        path : myConfig.parseAPI.version + '/classes/lists/' + list.objectId.trim(),
                        body : { position: list.position }
                    };
                    listsUpdated.push(listUpdated);
                }
                if(err) {
                    break;
                }
            }
            if(!err) {
                var options = {
                    method: 'POST',
                    url: myConfig.parseAPI.url + '/batch',
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify({ requests: listsUpdated })
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
            }
        }
    });
};

function getValidatedList(list, res){
    var listUpdated = {};
    if (list.name != undefined) {
        if (!(typeof list.name === 'string')) {
            res.status(400).json({err: 'bad list name'});
            return false;
        } else if (list.name != "") {
            listUpdated.name = list.name;
        }
    }
    if (list.desc != undefined) {
        if (!(typeof list.desc === 'string')) {
            res.status(400).json({err: 'bad list description'});
            return false;
        } else {
            listUpdated.desc = list.desc;
        }
    }
    if (list.position != undefined) {
        if (!myUtils.isNumber(list.position)) {
            res.status(400).json({err: 'bad list position'});
            return false;
        } else {
            listUpdated.position = list.position;
        }
    }
    if (list.ACL != undefined) {
        if (!(typeof list.ACL === 'object')) {
            res.status(400).json({err: 'bad list ACL'});
            return false;
        } else  {
            listUpdated.ACL = list.ACL;
        }
    }
    if (list.crossed != undefined) {
        if (!(typeof list.crossed === 'boolean')) {
            res.status(400).json({err: 'bad list crossed'});
            return false;
        } else  {
            listUpdated.crossed = list.crossed;
        }
    }
    if (list.layout_id != undefined) {
        if (!(typeof list.layout_id === 'object')) {
            res.status(400).json({err: 'bad list layout'});
            return false;
        } else {
            listUpdated.layout_id = list.layout_id;
        }
    }
    return listUpdated;
}