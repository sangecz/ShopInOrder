/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var request = require('request');

exports.index = function(req, res){

    // ID of the Google Spreadsheet
    var spreadsheetID = '1AXMgL5_oGzb6Sfv75rSKetpz4y7DA7SLTGYcB4Q8C04';

    // Make sure it is public or set to Anyone with link can view
    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";

    request({
        uri: url,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, data) {

        var entry = JSON.parse(data).feed.entry;
        var list = [];

        for(var i = 0; i < entry.length; i++){
            var e = {
                desc: entry[i].gsx$desc.$t,
                name: entry[i].gsx$name.$t,
                id: entry[i].gsx$id.$t
            };
            list.push(e);
        }

        res.status(200).json(list);
    });
};

exports.update = function(req, res){
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