Instruments = new Mongo.Collection('instruments');
Portfolio = new Mongo.Collection('portfolioUsers');
Recommendations = new Mongo.Collection('recommendations');

// Questions with answers for the customer
CustomerQuestions = new Mongo.Collection('customerQuestions');
// Channels the customers likes e.g. FX or German Cars
CustomerPreferences = new Mongo.Collection('customerPreferences');
// items with value and instrument the customer already has in its portfolio
CustomerPofolio = new Mongo.Collection('customerPortfolio');
// trades of the customer
CustomerTrades= new Mongo.Collection('customerTrades');

// General system settings
Settings = new Mongo.Collection('settings');



if (Meteor.isServer) {
  Meteor.publish('customerQuestion', function () {

    check(this.userId, String);
    var currentUserId = this.userId;
    return CustomerQuestions.find({user: currentUserId})
  });

  Meteor.publish('instruments', function (isin) {
    check(isin, String);
    return CustomerQuestions.find({_id: isin})
  });

  Meteor.publish('portfolio', function () {
    return Portfolio.find({_id:'KPwuZNECWHdrNpnp7'})
  });

  Meteor.publish('customerPreferences', function () {
    check(this.userId, String);
    var currentUserId = this.userId;
    return CustomerPreferences.find({user: currentUserId})
  });

  Meteor.publish('customerPortfolio', function () {
    check(this.userId, String);
    var currentUserId = this.userId;
    return CustomerPofolio.find({user: currentUserId})
  });

  Meteor.publish('customerTrades', function () {
    check(this.userId, String);
    var currentUserId = this.userId;
    return CustomerTrades.find({user: currentUserId})
  });

  Meteor.publish('recommendations', function () {
    return Recommendations.find({})
  });
}

AccountsTemplates.configure({
  negativeValidation: false,
  negativeFeedback: false,
  positiveValidation: false,
  positiveFeedback: false,
  homeRoutePath: '/'
});

