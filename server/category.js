/**
 * Created by sange on 17/12/15.
 */

var myConfig = require('./config');
var request = require('request');

exports.index = function(req, res){

    // ID of the Google Spreadsheet
    var spreadsheetID = myConfig.categorySpreadsheetId;

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
        var category = [];

        for(var i = 0; i < entry.length; i++){
            var e = {
                desc: entry[i].gsx$desc.$t,
                name: entry[i].gsx$name.$t,
                id: entry[i].gsx$id.$t
            };
            category.push(e);
        }

        res.status(200).json(category);
    });
};