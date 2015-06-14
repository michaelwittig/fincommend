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


var InstrumentModel = require("../model/instruments")(mongoose);

function tryImportISIN(isin, cb) {
	importISIN(isin, function(err, res) {
		if (err) {
			console.log("try import ISIN error: " + err.message, isin);
			cb();
		} else {
			cb(undefined, res);
		}
	});
}

function importISIN(isin, cb) {
	searchISIN(isin, function(err, id) {
		if (err) {
			cb(err);
		} else {
			console.log("importISIN", [isin, id]);
			getInstrument(id, function(err, instrument) {
				if (err) {
					cb(err);
				} else {
					// construct object
					var instr = new InstrumentModel();
					instr._id = instrument.isin;
					instr.name = instrument.name;
					instr.sector = instrument.sector;
					instr.branch = instrument.branch;
					instr.country = instrument.country;
					instr.volume = instrument.volume;
					instr.finanzen100id = id;
					instr.yrlow = instrument.yrlow;
					instr.yrhigh = instrument.yrhigh;
					instr.price = instrument.price;
					// upserting
					var upsertData = instr.toObject();
					InstrumentModel.update({ _id: instr._id }, { $set: upsertData  }, { upsert: true }, cb);
				}
			});
		}
	});
}

function getInstrument(id, cb) {
	if (id.type === "STOCK") {
		// http://burdahackday.finanzen100.de/v1/stock/snapshot?CHART_VARIANT=CHART_VARIANT_1&IDENTIFIER_TYPE=STOCK&IDENTIFIER_VALUE=86627
		request({
			method: "GET",
			uri: "http://burdahackday.finanzen100.de/v1/stock/snapshot",
			qs: {
				CHART_VARIANT: "CHART_VARIANT_1",
				IDENTIFIER_TYPE: id.type,
				IDENTIFIER_VALUE: id.value
			},
			json: true
		}, function(err, res, body) {
			if (err) {
				cb(err);
			} else {
				var volume = underscore.reduce(underscore.map(body.QUOTE_LIST, function(quote) { return parseFloat(quote.TOTAL_VOLUME) || 0; }), function(memo, num) { return memo + num; }, 0);
				cb(undefined, {
					isin: body.BASE_DATA.ISIN,
					name: body.BASE_DATA.NAME_COMPANY,
					sector: body.BASE_DATA.SECTOR,
					branch: body.BASE_DATA.BRANCH,
					country: body.BASE_DATA.ISO_COUNTRY,
					volume: volume,
					yrlow: body.QUOTE.LOW_PRICE_1_YEAR_R,
					yrhigh: body.QUOTE.HIGH_PRICE_1_YEAR_R,
					price: body.QUOTE.PRICE_R
				});
			}
		});
	} else {
		cb(new Error("only STOCK supported"));
	}

}
function searchISIN(isin, cb) {
	// http://burdahackday.finanzen100.de/v1/search/instrument_list?QUERY=DE0007100000
	request({
		method: "GET",
		uri: "http://burdahackday.finanzen100.de/v1/search/instrument_list",
		qs: {
			QUERY: isin
		},
		json: true
	}, function(err, res, body) {
		if (err) {
			cb(err);
		} else {
			if (res.statusCode === 200) {
				if (body.INSTRUMENT_LIST === undefined || body.INSTRUMENT_LIST.length === 0) {
					cb(new Error("isin not found"));
				} else if (body.INSTRUMENT_LIST.length === 1) {
					cb(undefined, {type: body.INSTRUMENT_LIST[0].IDENTIFIER.TYPE, value: body.INSTRUMENT_LIST[0].IDENTIFIER.VALUE});
				} else {
					cb(new Error("isin not unique"));
				}
			} else {
				cb(new Error("not 200"));
			}
		}
	});
}

function run(cb) {
	//fs.readFile("./isins.txt", {encoding: "utf8"}, function(err, data) {
	fs.readFile("./stocks.csv", {encoding: "utf8"}, function(err, data) {
		if (err) {
			cb(err);
		} else {
			//var isins = data.split("\n");
			var lines = data.split("\n");
			var isins = underscore.map(lines, function(line) { return line.split(",")[1]; });
			isins = underscore.filter(isins, function(isin) { if (isin === undefined) { return false; } return isin.length > 2; });
			isins = underscore.map(isins, function(isin) { return isin.replace(new RegExp('"', 'g'), ''); });
			isins = underscore.filter(isins, function(isin) { return isin.length === 12; });
			console.log("isins", isins.length);
			async.eachLimit(isins, 25, tryImportISIN, function(err) {
				if (err) {
					cb(err);
				} else {
					cb();
				}
			});
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
