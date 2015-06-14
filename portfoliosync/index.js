var async = require("async");
var request = require("request");
var underscore = require("underscore");
var mongoose = require("mongoose");
var AWS = require("aws-sdk");

var client_id = "CRRJA2oa3vAhDAFgkjKmN5QffwKMORGWPc7xcGPAQ-JQ";
var client_secret = "S14M02h9kH8UHxqtifyuytyClUMG8sFwRusrOmez50Cs";


// mongodb
var mongohost='cmeasy.cinovo.de:27017';
var mongodb=process.env.WUWDB || 'cmeasy';
var mongoConnection='mongodb://' + mongohost + '/' + mongodb;
mongoose.connect(mongoConnection);


var PortfolioUsersModel = require("../model/portfolioUsersModel")(mongoose);

function getPortfolio(token, cb) {
    console.log("getPortfolio", token);
    request({
        method: "GET",
        uri: "https://api.figo.me/rest/securities",
        auth: {
            bearer: token
        },
        json: true
    }, function(err, res, body) {
        if (err) {
            cb(err);
        } else {
            cb(undefined, body.securities);
        }
    });
}

function code2token(code, cb) {
    request({
        method: "POST",
        uri: "https://api.figo.me/auth/token",
        auth: {
            user: client_id,
            pass: client_secret
        },
        json: {
            grant_type: "authorization_code",
            code: code
            //redirect_uri: "" TODO
        }
    }, function(err, res, body) {
        if (err) {
            cb(err);
        } else {
            cb(undefined, body.access_token);
        }
    });
}

function importPortfolio(userId, code, cb) {
    code2token(code, function(err, code) {
        if (err) {
            cb(err);
        } else {
            getPortfolio(code, function(err, res) {
                if (err) {
                    cb(err);
                } else {
                    PortfolioUsersModel.remove({_id: userId}, function() {
                        // construct object
                        var portfolioUser = new PortfolioUsersModel();
                        portfolioUser._id = userId;
                        portfolioUser.portfolio = underscore.map(res, function(pos) {
                            return { isin: pos.isin, name: pos.name, currency: pos.currency, amount: pos.amount, purchase_price: pos.purchase_price, price: pos.price, quantity: pos.quantity };
                        });
                        PortfolioUsersModel.update({ _id: userId }, { portfolio: portfolioUser.portfolio }, { upsert: true }, cb);
                    });
                }
            });
        }
    });
}

function fetch() {
    console.log("fetch");
     var sqs = new AWS.SQS({
        "region": "eu-west-1",
        "accessKeyId": "AKIAJVQECWVBGGH5AROA",
        "secretAccessKey": "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"
      });
    sqs.receiveMessage({
        QueueUrl: "https://sqs.eu-west-1.amazonaws.com/329669840512/cmeasy-portfoliosync",
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 60,
        WaitTimeSeconds: 10
    }, function(err, data) {
        if (err) {
            console.log("error: " + err.message, err);
            setTimeout(fetch, 1000);
        } else {
            if (data.Messages === undefined || data.Messages.length === 0) {
                setTimeout(fetch, 1000);
            } else if (data.Messages.length === 1) {
                var message = data.Messages[0];
                var body = JSON.parse(message.Body);
                console.log("body", body);
                importPortfolio(body.userId, body.code, function(err) {
                    if (err) {
                        console.log("can not import Portfolio", err);
                        setTimeout(fetch, 1000);
                    } else {
                        sqs.deleteMessage({
                            QueueUrl: "https://sqs.eu-west-1.amazonaws.com/329669840512/cmeasy-portfoliosync",
                            ReceiptHandle: message.ReceiptHandle
                        }, function(err) {
                            if (err) {
                                console.log("can not delete message", err);
                            }
                            setTimeout(fetch, 1000);
                        });
                    }
                });
            } else {
                console.log("more than one message");
                setTimeout(fetch, 1000);
            }
        }
    });
}

// auto fetch from queue
fetch();


// use the link to get an code
// https://api.figo.me/auth/code?response_type=code&client_id=CRRJA2oa3vAhDAFgkjKmN5QffwKMORGWPc7xcGPAQ-JQ&scope=securities%3Dro&state=1
/*importPortfolio("user1", OMQ3QOXXf76SIVV876nYyH4RoPBJ2bHiiT6cU03FzCMndcDqyl54soPnD6EhPbCcE17_VSzuZm-zCyXGWDzz5-AhVHu6dUkHuMz1SQ2W0O9c", function(err) {
    if (err) {
        console.log("err", err);
    } else {
        console.log("done");
        mongoose.disconnect();
    }
});*/
