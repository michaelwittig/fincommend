var exec = require("child_process").exec;
var underscore = require("underscore");
var async = require("async");
var mongoose = require("mongoose");
var AWS = require("aws-sdk");
var request = require("request");


// mongodb
var mongohost='cmeasy.cinovo.de:27017';
var mongodb=process.env.WUWDB || 'cmeasy';
var mongoConnection='mongodb://' + mongohost + '/' + mongodb;
mongoose.connect(mongoConnection);


var InstrumentModel = require("../model/instruments")(mongoose);
var RecommendationModel = require("../model/recommendations")(mongoose);

function analyzeSide(isin, cb) {
    InstrumentModel.findById(isin, function(err, instr) {
        if (err) {
            cb(err);
        } else {
            var highlowratio = (instr.price-instr.yrlow)/(instr.yrhigh-instr.yrlow);
            var side = null;
            if (highlowratio > 0.7) {
                side = "sell";
            } else if (highlowratio < 0.3) {
                side = "buy";
            }
             cb(undefined, side);
        }
    });
}

function analyzePortfolio(r, cb) {
    exec(r, function (err, stdout, stderr) {
        if (err) {
            cb(err);
        } else {
            var lines = stdout.split("\n").splice(1);
            var recommendations = underscore.map(lines, function(line) {
                var values = line.replace(new RegExp('"', 'g'), '').split(" ");
                return {
                    isin: values[1],
                    score: parseFloat(values[2]) || 0
                };
            });
            recommendations = underscore.filter(recommendations, function(recom) {
                return recom.isin !== undefined && recom.isin.length === 12;
            });
            cb(undefined, recommendations);
        }
    });
}

function r(userId, rscript, source, cb) {
    analyzePortfolio(rscript, function(err, recommendations) {
        if (err) {
            cb(err);
        } else {
            async.mapLimit(recommendations, 10, function(reco, cb) {
                analyzeSide(reco.isin, function(err, side) {
                    if (err) {
                        cb(err);
                    } else {
                        reco.side = side;
                        cb(undefined, reco);
                    }
                });
            }, function(err, recommendations) {
                if (err) {
                    cb(err);
                } else {
                    recommendations = underscore.filter(recommendations, function(reco) { return reco.side !== null; });
                    async.eachLimit(recommendations, 10, function(reco, cb) {
                        var r = new RecommendationModel();
                        r.userId = userId;
                        r.isin = reco.isin;
                        r.side = reco.side;
                        r.date = new Date();
                        r.score = reco.score;
                        r.source = source;
                        InstrumentModel.findById(reco.isin, function(err, instr) {
                            if (err) {
                                cb(err);
                            } else {
                                r.instrument = instr;
                                r.save(cb);
                            }
                        });
                    }, cb);
                }
            });
        }
    });
}

function recommend(userId, cb) {
    async.parallel([
        function(cb) { return r(userId, "Rscript cos_rec.r \"" + userId + "\"", "cosrec", cb); },
        function(cb) { return r(userId, "Rscript cf.r \"" + userId + "\" social", "social", cb); },
        function(cb) { return r(userId, "Rscript cf.r \"" + userId + "\" popular", "popular", cb); }
        ], cb);
}

function fetch() {
    console.log("fetch");
     var sqs = new AWS.SQS({
        "region": "eu-west-1",
        "accessKeyId": "AKIAJVQECWVBGGH5AROA",
        "secretAccessKey": "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"
      });
    sqs.receiveMessage({
        QueueUrl: "https://sqs.eu-west-1.amazonaws.com/329669840512/cmeasy-recommender",
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
                recommend(body.userId, body.code, function(err) {
                    if (err) {
                        console.log("can not recommend", err);
                        setTimeout(fetch, 1000);
                    } else {
                        sqs.deleteMessage({
                            QueueUrl: "https://sqs.eu-west-1.amazonaws.com/329669840512/cmeasy-recommender",
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
//fetch();

// manual
recommend("KPwuZNECWHdrNpnp7", function(err, res) {
    if (err) {
        console.log("err", err);
    } else {
        console.log("done", res);
    }
});
