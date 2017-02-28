var request = require('request');

// Slack IDs
var clientId = process.env.SLACK_CLIENT_ID;
var clientSecret = process.env.SLACK_CLIENT_SECRET;

module.exports.handler = function(req, res){
  if (!req.query.code) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
      res.status(500);
      res.send({"Error": "Looks like we're not getting code."});
      console.log("Looks like we're not getting code.");
  } else {
      // If it's there...
      // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
      request({
          url: 'https://slack.com/api/oauth.access', //URL to hit
          qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
          method: 'GET', //Specify the method

      }, function (error, response, body) {
          if (error) {
              console.log(error);
          } else {
            console.log(body);
              res.json(body);
          }
      })
  }
}
