/* LIBs */
var express = require('express');
var bodyParser  = require('body-parser');
var passport = require('passport');
require('../controllers/auth');
var user = require('../controllers/user');
var order = require('../controllers/order');
var cookieParser = require('cookie-parser');
var socket = require('../controllers/sio');

/*//////////////// Try Socket
var data = {"type":"orderJoinRequest","sender":"Yara"}
socket.sendNotification(data)

var data = {"_id":"sender","orderFor":"Breakfast","resturant":"Rosto"}
socket.newFriendActivity(data)
///////////////*/

/* VARs */
var router = express.Router();

/* ROUTING */
router.use(cookieParser(), (req, res, next) => {
	res.locals.title = 'Yala Notlob';
	res.locals.helpers = {
		eachKey: function(obj, options) {
			var out = '';
			for (var key in obj) {
				out += options.fn(key);
			}
			return out;
		}
	};
	// allow remote control
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	if (req.cookies.token) {
		var email = user.userEmail(req.cookies.token);
		user.get(email, (user) => {
			// list all notifications
			if (user) {
				res.locals.user = user;
				order.getOrderRequests(email, user.orderRequests, (data) => {
					res.locals.orderRequests = data;
					next();
				});
			} else {
				res.cookie('token', '');
				next();
			}
		});
	} else {
		next();
	}
});

// use body parser so we can get info from POST and/or URL parameters
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
	if (res.locals.user) {
		order.latestOrders(res.locals.user._id, res.locals.user.orders, (orders) => {
			res.locals.orders = orders;
			order.friendsActivity(res.locals.user.friends, (err, data) => {
				res.locals.friendsActivity = data;
				console.log(data);
				res.render('user/index');
			});
		});
	} else {
		res.render('index');
	}
});

router.route('/login').
get((req, res) => {
	if (res.locals.user) {
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
		session: false ,
		failureRedirect: '/login'
	}),function(req,res){
		res.cookie('token', req.user);
		res.redirect('/');
	}
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
		session: false,
		failureRedirect: '/login'
	}),function(req,res){
		res.cookie('token', req.user);
		res.redirect('/');
	}
);

router.route('/register').
get((req, res) => {
	if (res.locals.user) {
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
		req.body['user-pass-conf'],
		'',
		function (err) {
			if(!err)
			{
				res.redirect('/login');
			}
			else
			{
				res.redirect('/register');
			}
		}
	);
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



router.get('/user/:friendID',(req, res) =>{
	user.get(req.params.friendID,function (friend) {
		res.render('user/friend-profile',{friend: friend});
	});
});

router.get('/user/:friendID/delete', (req, res) => {
	user.removeFriend(res.locals.user._id, req.params.friendID);
	res.redirect('/friends');
});

router.route('/friends').
get((req, res) =>{
	user.listFriends(res.locals.user.friends,(err,data) =>
	{
		res.render('user/friends', {friends:data});
	});
}).

post((req,res) =>{
	console.log(req.body);
	user.addFriend(
		res.locals.user._id,
		req.body['add-friend'],
		function (err,data) {
			res.redirect('friends');
		}
	);
});

router.route('/groups').
get((req, res) => {
	res.render('user/groups');
}).
post((req, res) =>{
	console.log(req.body);
	user.createGroup(
		res.locals.user._id,
		req.body['add-group']
	);
	res.redirect('groups');
});

router.get('/group/:groupID', (req, res) => {
	res.render('user/group', {groupID: req.params.groupID});
});

router.get('/group/:groupID/delete', (req, res) => {
	user.deleteGroup(res.locals.user._id, req.params.groupID);
	res.redirect('/groups');
});

router.get('/orders', (req, res) => {
	order.listOrders(res.locals.user._id, res.locals.user.orders, (err, data) => {
		res.render('user/orders', {orders: data});
	});
});

router.route('/order/:orderID').
get((req, res) => {
	order.get(res.locals.user._id, req.params.orderID, (order) => {
		res.render('user/order', {order: order});
	});
}).
post((req, res) => {
	console.log(req.body);
	order.addItem(
		res.locals.user._id,
		req.params.orderID,
		req.body['order-item'],
		req.body['order-amount'],
		req.body['order-price'],
		req.body['order-comment'],
		() => {
			// TODO handle error
			order.get(res.locals.user._id, req.params.orderID, (order) => {
				res.render('user/order', {order: order});
			});
		}
	);
});

router.get('/order/:orderID/accept', (req, res) => {
	order.accept(res.locals.user._id, req.params.orderID);
	res.redirect('/order/'+req.params.orderID);
});

router.route('/order-new').
get((req, res) => {
	res.render('user/order-new');
}).
post((req, res) => {
	console.log(req.body);
	order.create(
		res.locals.user._id,
		req.body['order-type'],
		req.body['order-restaurant'],
		req.body['order-friends'].split(','),
		'',
		(err, orderID) => {
			if (!err) {
				res.redirect('/order/'+orderID);
			} else {
				res.redirect('/orders');
			}
		}
	);
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
