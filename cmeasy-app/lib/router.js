Router.configure({
  layoutTemplate: 'layout'
});

Meteor.startup(function () {
  if (Meteor.isClient) {
    var location = Iron.Location.get();
    if (location.queryObject.platformOverride) {
      Session.set('platformOverride', location.queryObject.platformOverride);
    }
  }
});

Router.map(function() {
  this.route('index', {
        path: '/',

    waitOn: function() {
        return Meteor.subscribe('recommendations');ç
    },
    data: function() {
          recommends = Recommendations.find({}).fetch()
          console.log(recommends)
          return {
              recommends: Recommendations.find({},{sort: {score: -1}, limit:20})
              };
    }
  });

  this.route('userAccounts');
  this.route('kpi');
  this.route('infodetails');
  this.route('apiLogin');
  this.route('settings');
  this.route('trades');
  this.route('channeldetail');
});

Router.route('questions', {
  waitOn: function() {
    if (Meteor.userId())
      return Meteor.subscribe('customerQuestion');
  },
  data: function() {
    return {
      questions: CustomerQuestions.find({ user: Meteor.userId() })
    };
  }
});

Router.route('preferences', {
  waitOn: function() {
    if (Meteor.userId())
      return Meteor.subscribe('customerPreferences');
  },
  data: function() {
    return {
      preferences: CustomerPreferences.find({ user: Meteor.userId() })
    };
  }
});

Router.route('portfolio', {
  waitOn: function() {
      return Meteor.subscribe('portfolio');
  },
  data: function() {
    port = Portfolio.find({}).fetch()
    console.log(port)
    return {
      portfolios: Portfolio.find({})
    };
  }
});

Router.route('history', {
  waitOn: function() {
    if (Meteor.userId())
      return Meteor.subscribe('customerTrades');
  },
  data: function() {
    return {
      trades: CustomerTrades.find({ user: Meteor.userId() })
    };
  }
});

Router.route('infos', {
  waitOn: function() {
    if (Meteor.userId())
      return Meteor.subscribe('customerInformationItems');
  },
  data: function() {
    return {
      infos: CustomerInformationItems.find({ user: Meteor.userId() })
    };
  }
});


//?state=1&code=OGj5VOWBBk2f2ztMnaOEb_ZcKVjV-bF0Kjzuy0ZsnlejN9d8D4sunWaHJjPpE6w5dY5tvmKpFrvMEv6MvQYQXEW7ALRF1xKK-Yo9C2t4CMK4


Router.route('figologin', function () {
  //var code = this.params.query.code
  var sqs = new AWS.SQS({
    "region": "eu-west-1",
    "accessKeyId": "AKIAJVQECWVBGGH5AROA",
    "secretAccessKey": "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"
  });
  sqs.sendMessage({
    MessageBody: JSON.stringify({
      code: this.params.query.code,
      userId: Meteor.userId() 
    }),
    QueueUrl: "https://sqs.eu-west-1.amazonaws.com/329669840512/cmeasy-portfoliosync",
  }, function(err) {
    if (err) {
      // TODO
    } else {
      // TODO
    }
  });
});

Router.plugin('ensureSignedIn', {
  only: ['index']
});

T9n.setLanguage("en")
