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
        }
    });

    req.on('end', function() {

        if(!err) {
            if (list.name === undefined || list.position === undefined
                || list.layout_id === undefined || list.ACL === undefined) {
                res.status(400).json({err: 'missing required parameter (name, position, layout_id, ACL)'});
            } else if (!(typeof list.name === 'string')) {
                res.status(400).json({err: 'bad list name'});
            } else if (!(typeof list.desc === 'string')) {
                res.status(400).json({err: 'bad list description'});
            } else if (!myUtils.isNumber(list.position)) {
                res.status(400).json({err: 'bad list position'});
            } else if (!(typeof list.ACL === 'object')) {
                res.status(400).json({err: 'bad list ACL'});
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

                existsLayout(list.layout_id, token, function (proceed, errMsg) {
                    if (!proceed) {
                        res.status(400).json({err: errMsg});
                    } else if (list.layout_id != "") {
                        // adjustment for Parse
                        if (list.layout_id == null) {
                            list.layout_id = null;
                        } else {
                            list.layout_id = {
                                __type: "Pointer",
                                className: "layouts",
                                objectId: list.layout_id
                            };
                        }

                        options.body = JSON.stringify(list);

                        request(options, cb);
                    }
                });
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
        }

    });

    req.on('end', function() {

        if(!err) {
            var listUpdated = {};
            if (list.name != undefined) {
                if (!(typeof list.name === 'string')) {
                    res.status(400).json({err: 'bad list name'});
                } else if (list.name != "") {
                    listUpdated.name = list.name;
                }
            }
            if (list.desc != undefined) {
                if (!(typeof list.desc === 'string')) {
                    res.status(400).json({err: 'bad list description'});
                } else {
                    listUpdated.desc = list.desc;
                }
            }
            if (list.position != undefined) {
                if (!myUtils.isNumber(list.position)) {
                    res.status(400).json({err: 'bad list position'});
                } else if (list.position != "") {
                    listUpdated.position = list.position;
                }
            }
            if (list.ACL != undefined) {
                if (!(typeof list.ACL === 'object')) {
                    res.status(400).json({err: 'bad list ACL'});
                } else if (list.ACL != "") {
                    listUpdated.ACL = list.ACL;
                }
            }
            if (list.layout_id != undefined) {
                existsLayout(list.layout_id, token, function (proceed, errMsg) {
                    if (!proceed) {
                        res.status(400).json({err: errMsg});
                    } else {
                        listUpdated.layout_id = list.layout_id;
                        next();
                    }
                });
            } else {
                next();
            }

            function next() {
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

                // adjustment for Parse
                if (list.layout_id == null) {
                    listUpdated.layout_id = null;
                } else {
                    listUpdated.layout_id = {
                        __type: "Pointer",
                        className: "layouts",
                        objectId: list.layout_id
                    };
                }
                options.body = JSON.stringify(listUpdated);

                request(options, cb);
            }
        }
    });
};

function existsLayout(layout_id, token, callback) {
    if(layout_id === null) {
        callback(true, null);
        return;
    }
    if(!(typeof layout_id === 'string')){
        callback(false, 'list layout_id not a string');
        return;
    }
    if(layout_id === ''){
        callback(false, 'list layout_id could not by empty string');
        return;
    }

    var url = myConfig.parseAPI.url + '/classes/layouts/' + layout_id.trim();
    var options = {
        method: 'GET',
        url: url,
        headers: myConfig.parseAPI.headers
    };
    options.headers['X-Parse-Session-Token'] = token;

    function cb(error, response, body) {
        if (response.statusCode == 404) {
            callback(false, "list layout_id '" + layout_id +"' does not exists");
        } else {
            callback(true, null);
        }
    }
    request(options, cb);
}