var config = require('../config');
var User = require('../models/user');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var jwt = require('jsonwebtoken');


//authentication for facebook
passport.use('facebook', new FacebookStrategy({
	clientID        : config.fbAuth.appID,
	clientSecret    : config.fbAuth.appSecret,
	callbackURL     : config.fbAuth.callbackUrl,
	profileFields: ['email', 'name']
}, function(access_token, refresh_token, profile, done) {
	logUser(profile, done);
}));


//authentication for Google
passport.use('google',new GoogleStrategy({
	clientID: config.googleAuth.client_id,
	clientSecret: config.googleAuth.client_secret,
	callbackURL: config.googleAuth.callbackUrl,
	passReqToCallback   : true
}, function(request, accessToken, refreshToken, profile, done) {
	logUser(profile, done);
}));

function logUser(profile, done){

	User.findOne({ '_id' : profile.emails[0].value }, function(err, user) {

		if (err)
			//done(err,user,info) --> method called internally by the strategy implementation
			return done(err);

		if (user) {
			var token = jwt.sign({ '_id': user._id }, 'secret', { algorithm: 'HS256'});
			return done(null,token);
		}

		//register new user
		else {
			var newUser = new User();

			newUser._id    = profile.emails[0].value;
			newUser.fb_access_token = profile.access_token;
			newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
			newUser.save(function(err) {

				if (!err)
					var token = jwt.sign({ '_id': newUser._id }, 'secret', { algorithm: 'HS256'});
					return done(null,token);
			});
		}
	});
}
