/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var myUtils = require('./myUtils');
var request = require('request');

exports.listForList = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';
    var list_id = req.params.list_id;
    var url = myConfig.parseAPI.url + '/classes/items?where={"list_id": {"objectId" : "'+list_id+'", "__type":"Pointer","className":"lists" }}';
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

exports.list = function(req, res){

    var token = req.headers.token != undefined &&  req.headers.token != null ?  req.headers.token : '';

    var url = myConfig.parseAPI.url + '/classes/items';
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

    var url = myConfig.parseAPI.url + '/classes/items/' + id.trim();
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

    var url = myConfig.parseAPI.url + '/classes/items/' + id;
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
    var items = [];
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            items = JSON.parse(chunk);
            console.log(JSON.stringify(items));
        }
    });

    req.on('end', function() {
        if(!err) {
            var itemsUpdated = [];
            for(var i = 0; i < items.length && !err; i++) {
                var list = items[i];
                if(list.objectId == undefined ){
                    err = true;
                    res.status(400).json({err: 'item objectId missing.'});
                } else {
                    var itemUpdated = {
                        method : 'DELETE',
                        path : myConfig.parseAPI.version + '/classes/items/' + list.objectId.trim()
                    };
                    itemsUpdated.push(itemUpdated);
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
                    body: JSON.stringify({ requests: itemsUpdated })
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

    var item = {};
    var err = false;
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            item.name = parsedChunk.name;
            item.desc = parsedChunk.desc == undefined ? "" : parsedChunk.desc;
            item.category = parseInt(parsedChunk.category);
            item.list_id = parsedChunk.list_id;
            item.ACL = parsedChunk.ACL;
            item.crossed = parsedChunk.crossed;
        }
    });

    req.on('end', function() {

        if(!err) {
            if (item.name === undefined || item.category === undefined
                || item.list_id === undefined || item.ACL === undefined || item.crossed == undefined) {
                res.status(400).json({err: 'missing required parameter (name, category, list_id, ACL, crossed)'});
            } else if (!(typeof item.name === 'string')) {
                res.status(400).json({err: 'bad item name'});
            } else if (!(typeof item.desc === 'string')) {
                res.status(400).json({err: 'bad item description'});
            } else if (!myUtils.isNumber(item.category)) {
                res.status(400).json({err: 'bad item category'});
            } else if (!(typeof item.ACL === 'object')) {
                res.status(400).json({err: 'bad item ACL'});
            } else if (!(typeof item.list_id === 'object')) {
                res.status(400).json({err: 'bad item list_id'});
            } else if (!(typeof item.crossed === 'boolean')) {
                res.status(400).json({err: 'bad item crossed'});
            } else {

                var options = {
                    method: 'POST',
                    url: myConfig.parseAPI.url + '/classes/items',
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify(item)
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
    var item = {};
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            item.name = parsedChunk.name;
            item.desc = parsedChunk.desc;
            item.category = parseInt(parsedChunk.category);
            item.list_id = parsedChunk.list_id;
            item.ACL = parsedChunk.ACL;
            item.crossed = parsedChunk.crossed;
        }
    });

    req.on('end', function() {

        if(!err) {
            var itemUpdated = {};
            if (item.name != undefined) {
                if (!(typeof item.name === 'string')) {
                    res.status(400).json({err: 'bad item name'});
                    err = true;
                } else if (item.name != "") {
                    itemUpdated.name = item.name;
                }
            }
            if (item.desc != undefined) {
                if (!(typeof item.desc === 'string')) {
                    res.status(400).json({err: 'bad item description'});
                    err = true;
                } else {
                    itemUpdated.desc = item.desc;
                }
            }
            if (item.category != undefined) {
                if (!myUtils.isNumber(item.category)) {
                    res.status(400).json({err: 'bad item category'});
                    err = true;
                } else  {
                    itemUpdated.category = item.category;
                }
            }
            if (item.ACL != undefined) {
                if (!(typeof item.ACL === 'object')) {
                    res.status(400).json({err: 'bad item ACL'});
                    err = true;
                } else {
                    itemUpdated.ACL = item.ACL;
                }
            }
            if (item.crossed != undefined) {
                if (!(typeof item.crossed === 'boolean')) {
                    res.status(400).json({err: 'bad item crossed'});
                    err = true;
                } else  {
                    itemUpdated.crossed = item.crossed;
                }
            }
            if (item.list_id != undefined) {
                if (!(typeof item.list_id === 'object')) {
                    res.status(400).json({err: 'bad item list_id'});
                    err = true;
                } else {
                    itemUpdated.list_id = item.list_id;
                }
            }

            if(!err){
                var options = {
                    method: 'PUT',
                    url: myConfig.parseAPI.url + '/classes/items/' + id.trim(),
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify(itemUpdated)
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




