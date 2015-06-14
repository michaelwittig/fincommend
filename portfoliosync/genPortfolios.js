var fs = require("fs");
var async = require("async");
var request = require("request");
var underscore = require("underscore");
var mongoose = require("mongoose");



// mongodb
var mongohost='cmeasy.cinovo.de:27017';
var mongodb=process.env.WUWDB || 'cmeasy';
var mongoConnection='mongodb://' + mongohost + '/' + mongodb;
mongoose.connect(mongoConnection);


var PortfolioUsersModel = require("../model/portfolioUsers")(mongoose);

function run(cb) {
	//fs.readFile("./isins.txt", {encoding: "utf8"}, function(err, data) {
	fs.readFile("./isins.txt", {encoding: "utf8"}, function(err, data) {
		if (err) {
			cb(err);
		} else {
			var isins = data.split("\n");
            var genIsins = underscore.shuffle(isins).splice(25, 30);

            var port = new PortfolioUsersModel();
            port._id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            async.each(genIsins, function(i, cb) {
                port.portfolio.push({isin: i});
                cb();
            }, function() {
                port.save();
                cb();
            });

            console.log(port);

		}
	});
}

run(function(err, res) {
	if (err) {
		console.log("err", err);
	} else {
		console.log("done", res);
	}
	mongoose.disconnect();
});
