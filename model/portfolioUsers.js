module.exports = function(mongoose) {
    var embeddedPortfolioSchema = new mongoose.Schema({
        isin: String,
        name: String,
        currency: String,
        amount: Number,
        purchase_price: Number,
        price: Number,
        quantity: Number
    }, {
        _id: false
    });
    var portfolioUsersSchema = new mongoose.Schema({
        _id: String,
        portfolio: [embeddedPortfolioSchema],
    }, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });
    portfolioUsersSchema.virtual('email').get(function () { return this._id; });
    return mongoose.model('PortfolioUsers', portfolioUsersSchema, 'portfolioUsers');
};
