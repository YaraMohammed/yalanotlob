var config = require('../config');
var User = require('../models/user');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;


//authentication for facebook
passport.use('facebook', new FacebookStrategy({
	clientID        : config.fbAuth.appID,
	clientSecret    : config.fbAuth.appSecret,
	callbackURL     : config.fbAuth.callbackUrl,
	profileFields: ['email', 'name']
},

// facebook will send back the tokens and profile
function(access_token, refresh_token, profile, done) {

	console.log(profile.name.givenName);
	// asynchronous
	process.nextTick(function() {
		// find the user in the database based on their facebook id
		User.findOne({ '_id' : profile.emails[0].value }, function(err, user) {
			// if there is an error, stop everything and return that
			// ie an error connecting to the database
			if (err)
				return done(err);
				// if the user is found, then log them in
			if (user) {
				//TODO return token
				console.log('xyz', user);
			}
			else {
				// if there is no user found with that facebook id, create them
				var newUser = new User();
				// set all of the facebook information in our user model
				newUser._id    = profile.emails[0].value;
				newUser.fb_access_token = profile.access_token; // we will save the token that facebook provides to the user
				newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
				// save our user to the database
				newUser.save(function(err) {
					if (err)
						throw err;
					// if successful, return the new user
					return done(null, newUser);
				});
			}
		});
	});
}));
