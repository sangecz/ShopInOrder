/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var request = require('request');

exports.index = function(req, res){

    // ID of the Google Spreadsheet
    var spreadsheetID = '1HvdrpO4rSg1LHJzLgIZfzHjRMf8uT2lYI9IivhU2fH0';

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
        var layout = [];

        for(var i = 0; i < entry.length; i++){
            var e = {
                desc: entry[i].gsx$desc.$t,
                name: entry[i].gsx$name.$t,
                id: entry[i].gsx$id.$t,
                categories: entry[i].gsx$categories.$t
            };
            layout.push(e);
        }

        res.status(200).json(layout);
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
        } else if(!isUncategorizedIn(item)) {
            res.status(400).json({err: "missing category: 'uncategorized'"});
        } else if(hasDuplicates(item.categories)) {
            res.sendStatus(400).json({err: 'duplicate categories'});
        } else {

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






