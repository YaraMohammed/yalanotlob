/* LIBs */
var express = require('express');
var bodyParser  = require('body-parser');
var passport = require('passport');
var auth = require('../controllers/auth');
var user = require('../controllers/user');
var order = require('../controllers/order');
var cookieParser = require('cookie-parser');

/* VARs */
var router = express.Router();

/* ROUTING */
router.use(cookieParser(), (req, res, next) => {
	res.locals.title = 'Yala Notlob';
	res.locals.helpers = {
		b64Decode: function(b64) {
			return Buffer.from(b64, 'base64').toString();
		}
	};
	// allow remote control
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	if (req.cookies.token) {
		res.locals.email = user.userEmail(req.cookies.token);
	}
	next();
});

// use body parser so we can get info from POST and/or URL parameters
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
	if (res.locals.email) {
		order.latestOrders(res.locals.email, (orders) => {
			res.locals.orders = orders;
			res.render('user/index');
		});
	} else {
		res.render('index');
	}
});

router.route('/login').
get((req, res) => {
	if (res.locals.email) {
		res.redirect('/');
	} else {
		res.render('auth/login');
	}
}).
post((req, res) => {
	user.token(req.body['user-email'], req.body['user-pass'], function(token) {
		if (token != null) {
			res.cookie('token', token);
			res.redirect('/');
		} else {
			console.log('Authentication failed for '+req.body['user-email']);
			res.redirect('/login');
		}
	});
});

// route for facebook authentication and login
router.get('/login/facebook', passport.authenticate('facebook', { scope : 'email' }
));

// handle the callback after facebook has authenticated the user
router.get('/login/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

// route for google authentication and login
router.get('/login/google', passport.authenticate('google', {
	scope: [
		'https://www.googleapis.com/auth/plus.login',
		'https://www.googleapis.com/auth/plus.profile.emails.read'
	]
}));

// handle the callback after google has authenticated the user
router.get('/login/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

router.route('/register').
get((req, res) => {
	if(res.locals.email) {
		res.redirect('/');
	} else {
		res.render('auth/register');
	}
}).
post((req, res) => {
	console.log(req.body);
	user.register(
		req.body['user-name'],
		req.body['user-email'],
		req.body['user-pass'],
		''
	);
	res.redirect('/login');
});

router.route('/forgot-pass').
get((req, res) => {
	res.render('auth/forgot-pass');
}).
post(() => {
	throw 'Not yet implemented';
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

router.route('/order/:orderID').
get((req, res) => {
	order.get(res.locals.email, req.params.orderID, (order) => {
		res.render('user/order', {order: order});
	});
}).
post((req, res) => {
	console.log(req.body);
	order.addItem(
		res.locals.email,
		req.params.orderID,
		req.body['order-item'],
		req.body['order-amount'],
		req.body['order-price'],
		req.body['order-comment'],
		() => {
			// TODO handle error
			order.get(res.locals.email, req.params.orderID, (order) => {
				res.render('user/order', {order: order});
			});
		}
	);
});

router.route('/order-new').
get((req, res) => {
	res.render('user/order-new');
}).
post((req, res) => {
	console.log(req.body);
	order.create(
		res.locals.email,
		req.body['order-type'],
		req.body['order-restaurant'],
		req.body['order-friends'].split(','),
		''
	);
	// TODO get `_id` of created order and redirect to /order/`_id`
	res.redirect('/orders');
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
