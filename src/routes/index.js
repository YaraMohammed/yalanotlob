/* LIBs */
var express = require('express');
var bodyParser  = require('body-parser');
var passport = require('passport');
var aoth = require('../controllers/auth');
var user = require('../controllers/user');

/* VARs */
var router = express.Router();

/* ROUTING */
router.use((req, res, next) => {
	res.locals.title = 'Yala Notlob';
	next();
});

// allow remote controlle
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// use body parser so we can get info from POST and/or URL parameters
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
	res.render('index');
});

router.route('/login').
get((req, res) => {
	res.render('auth/login');
}).
post((req, res) => {
	user.token(req.body['user-email'], req.body['password'], function(token) {
		console.log(token);
		if (token != null) {
			res.setCookie('token', token);
		} else {
			console.log('Authentication failed for '+req.body['user-email']);
		}
	});
});

// route for facebook authentication and login
router.get('/login/facebook', passport.authenticate('facebook', { scope : 'email' }
));

// handle the callback after facebook has authenticated the user
router.get('/login/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/home',
    failureRedirect : '/'
  })
);

router.route('/register').
get((req, res) => {
	res.render('auth/register');
}).
post(() => {
	throw 'Not yet implemented';
});

router.route('/forgot-pass').
get((req, res) => {
	res.render('auth/forgot-pass');
}).
post(() => {
	throw 'Not yet implemented';
});

router.get('/home', (req, res) => {
	res.render('user/home');
});

router.get('/profile', (req, res) => {
	res.render('user/profile');
});

router.get('/friends', (req, res) => {
	res.render('user/friends');
});

router.get('/groups', (req, res) => {
	res.render('user/groups');
});

router.get('/orders', (req, res) => {
	res.render('user/orders');
});

router.get('/order', (req, res) => {
	res.render('user/order');
});

router.get('/order-new', (req, res) => {
	res.render('user/order-new');
});

router.get('/order-sum', (req, res) => {
	res.render('user/order-sum');
});

router.get('/notifications', (req, res) => {
	res.render('user/notifications');
});

router.use(express.static(__dirname + '/../static', {extensions: 'html'}));

/* EXPORTING */
module.exports = router;
