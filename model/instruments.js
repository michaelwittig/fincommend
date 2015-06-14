module.exports = function(mongoose) {
    var InstrumentSchema = new mongoose.Schema({
        _id: String,
        name: String,
        sector: String,
        branch: String,
        country: String,
        volume: Number,
        finanzen100id: Object,
        yrlow: Number,
        yrhigh: Number,
        price: Number
    }, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });
    InstrumentSchema.virtual('isin').get(function () { return this._id; });
    return mongoose.model('Instruments', InstrumentSchema, 'instruments');
};
