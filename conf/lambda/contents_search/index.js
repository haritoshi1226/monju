var AWS = require('aws-sdk');
var client = require('cheerio-httpcli');
var uuid = require('node-uuid');

var dynamo = new AWS.DynamoDB({
    region: 'us-east-1'
});
var title = "";
var description = "";
var favicon = "";

function get_td(url){
    return new Promise(function(resolve, reject) {
        client.fetch(url, function (err, $, res) {
            if (err) {
                console.log(err);
                reject();
            } else {
                title = $('title').text();
                if (!title){
                    title = "";
                }
                description = $("meta[name=description]").attr("content");
                if (!description){
                    description = "";
                }
                favicon = "https://www.google.com/s2/favicons?domain="+url;
                resolve();
            }
        });
    });
}

function add_table(item){
    const param = {
        TableName: "contents",
        Item: item
    };
    dynamo.putItem(param, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(data);
        }
    });
}

exports.handler = (event, context, callback) => {
    // console.log(event.url);
    const params = {
        TableName: "contents",
        KeyConditionExpression: "#key = :value",
        ExpressionAttributeNames:{
            '#key': 'url'
        },
        ExpressionAttributeValues: {
            ":value": {S: event.url}
        },
    };
    // console.log(params);
    dynamo.query(params, function(err, data){
        if(err){
            // console.log(err, err.stack);
            callback(null, "Error");
        }else{
            if (data.Count > 0){
                let r = {};
                let keys = Object.keys(data.Items[0]);
                // console.log(keys);
                r.result = true;
                if (keys.indexOf("title") >= 0){
                    r.title = data.Items[0].title['S'];
                }else{
                    r.title = "";
                }
                if (keys.indexOf("description") >= 0){
                    r.description = data.Items[0].description['S'];
                }else{
                    r.description = "";
                }
                if (keys.indexOf("favicon") >= 0){
                    r.favicon = data.Items[0].favicon['S'];
                }else{
                    r.favicon = "";
                }
                callback(null, r);
            }else{
                Promise.all([get_td(event.url)]).then(function () {
                    const res = {
                      "title": title,
                      "description": description,
                      "favicon": favicon
                    };
                    callback(null, res);

                    let dt = new Date();
                    dt.setHours(dt.getHours() + 9);
                    let item = {};
                    item.url = {S: event.url};
                    item.created_at = {S: dt.toString()};
                    item.contents_id = {S: uuid.v4().split('-').join('')};
                    if (title) item.title = {S: title};
                    if (description) item.description = {S: description};
                    if (favicon) item.favicon = {S: favicon};
                    // console.log(item);
                    add_table(item);

                }).catch(function (err) {
                    const res = {
                        "result": true,
                        "message": "URL error"
                    };
                    callback(null, res);
                });
            }
        }
    })
};
