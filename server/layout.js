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

    var err = false;
    var layout = {};
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            layout.name = parsedChunk.name;
            layout.desc = parsedChunk.desc == undefined ? "" : parsedChunk.desc;
            layout.position = parsedChunk.position;
            layout.categories = parsedChunk.categories;
            layout.ACL = parsedChunk.ACL;
        }
    });

    req.on('end', function() {
        if(!err) {
            if (layout.name == undefined || layout.position == undefined
                || layout.categories == undefined || layout.ACL == undefined) {
                res.status(400).json({err: 'missing required parameter (name, position, categories, ACL)'});
            } else if (!(typeof layout.name === 'string')) {
                res.status(400).json({err: 'bad layout name'});
            } else if (!(typeof layout.desc === 'string')) {
                res.status(400).json({err: 'bad layout description'});
            } else if (!myUtils.isNumber(layout.position)) {
                res.status(400).json({err: 'bad layout position'});
            } else if (!(typeof layout.ACL === 'object')) {
                res.status(400).json({err: 'bad layout ACL'});
            } else {
                var options = {
                    method: 'POST',
                    url: myConfig.parseAPI.url + '/classes/layouts',
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

                onlyPossibleCategories(layout.categories, function (proceed, errMsg) {
                    if (!proceed) {
                        res.status(400).json({err: errMsg});
                    } else if (layout.categories != "") {
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
    var layout = {};
    req.on('data', function(chunk) {
        if(!myUtils.isJSON(chunk)) {
            err = true;
            res.status(400).json({err: 'not a valid JSON string'});
        } else {
            var parsedChunk = JSON.parse(chunk);
            layout.name = parsedChunk.name;
            layout.desc = parsedChunk.desc;
            layout.position = parsedChunk.position;
            layout.categories = parsedChunk.categories;
            layout.ACL = parsedChunk.ACL;
        }
    });

    req.on('end', function() {
        if(!err) {
            var layoutUpdated = {};
            if (layout.name != undefined) {
                if (!(typeof layout.name === 'string')) {
                    res.status(400).json({err: 'bad layout name'});
                } else if (layout.name != "") {
                    layoutUpdated.name = layout.name;
                }
            }
            if (layout.desc != undefined) {
                if (!(typeof layout.desc === 'string')) {
                    res.status(400).json({err: 'bad layout description'});
                } else {
                    layoutUpdated.desc = layout.desc;
                }
            }
            if (layout.position != undefined) {
                if (!myUtils.isNumber(layout.position)) {
                    res.status(400).json({err: 'bad layout position'});
                } else if (layout.position != "") {
                    layoutUpdated.position = layout.position;
                }
            }
            if (layout.ACL != undefined) {
                if (!(typeof layout.ACL === 'object')) {
                    res.status(400).json({err: 'bad layout ACL'});
                } else if (layout.ACL != "") {
                    layoutUpdated.ACL = layout.ACL;
                }
            }
            if (layout.categories != undefined) {
                onlyPossibleCategories(layout.categories, function (proceed, errMsg) {
                    if (!proceed) {
                        res.status(400).json({err: errMsg});
                    } else if (layout.categories != "") {
                        layoutUpdated.categories = layout.categories;
                        next();
                    }
                });
            } else {
                next();
            }

            function next() {
                var options = {
                    method: 'PUT',
                    url: myConfig.parseAPI.url + '/classes/layouts/' + id,
                    headers: myConfig.parseAPI.headers,
                    body: JSON.stringify(layoutUpdated)
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

function isUncategorizedIn(item) {
    for(var i = 0; i < item.length; i++){
        if(item[i] == 0){
            return true;
        }
    }
    return false;
}

function onlyPossibleCategories(arr, callback) {

    if(!myUtils.isArray(arr)) {
        callback(false, 'layout categories not an array');
        return;
    }
    if(arr.length == 0) {
        callback(false, 'layout categories empty array');
        return;
    }
    if(!isUncategorizedIn(arr)) {
        callback(false, "layout categories does not contains uncategorized '0' (zero) element");
        return;
    }
    if(myUtils.hasDuplicates(arr)) {
        callback(false, 'layout categories contains duplicities');
        return;
    }

    // ID of the Google Spreadsheet
    var spreadsheetID = myConfig.categorySpreadsheetId;

    // Make sure it is public or set to Anyone with link can view
    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";

    function cb(error, response, data) {
        var entry = JSON.parse(data).feed.entry;
        var category = [];

        for(var i = 0; i < entry.length; i++){
            category.push(parseInt(entry[i].gsx$id.$t));
        }

        for(var j = 0; j < arr.length; j++) {
            if(category.indexOf(arr[j]) < 0) {  // not in array
                console.log("elem not in categories");
                callback(false, "layout categories elem '" + arr[j] + "' not in allowed categories (" + category + ")");
                return;
            }
        }
        callback(true, null);
    }

    request({
        uri: url,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, cb);
}





