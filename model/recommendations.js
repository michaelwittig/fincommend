module.exports = function(mongoose) {
	var RecommendationSchema = new mongoose.Schema({
		userId: String,
	    isin: String,
	    instrument: Object,
	    side: String,
	    date: Date,
	    score: Number,
	    source: String
	});
	return mongoose.model('Recommendations', RecommendationSchema, 'recommendations');
};
