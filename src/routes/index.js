/* LIBs */
var express = require('express');
var bodyParser  = require('body-parser');
var passport = require('passport');
require('../controllers/auth');
var user = require('../controllers/user');
var order = require('../controllers/order');
var cookieParser = require('cookie-parser');
var upload = require('multer')({ dest: 'uploads/' });

/* VARs */
var router = express.Router();

/* ROUTING */
router.use(cookieParser(), (req, res, next) => {
	res.locals.title = 'Yala Notlob';
	res.locals.helpers = {
		ifEq: function(x1, x2, options) {
			if (x1 == x2) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
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
	res.locals.layout = 'guest';
	if (req.cookies.token) {
		var email = user.userEmail(req.cookies.token);
		user.get(email, (user) => {
			// list all notifications
			if (user) {
				res.locals.user = user;
				res.locals.layout = 'user';
				order.getNotifs(user, (notifs) => {
					res.locals.notifications = notifs;
					next();
				});
			} else if (req.url == '/logout' || req.url.startsWith('/assets/')) {
				next();
			} else {
				res.redirect('/logout');
			}
		});
	} else {
		next();
	}
});

// use body parser so we can get info from POST and/or URL parameters
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
	// var data = {'type':'orderJoinRequest','sender':'Yara'};
	// var invited = [ 'eng.yara4@gmail.com', 'yara.mohamed174@gmail.com' ];
	// socket.sendJoinReq(data,invited);
	if (res.locals.user) {
		order.latestOrders(res.locals.user._id, res.locals.user.orders, (orders) => {
			for (var i = 0; i < orders.length; i++) {
				orders[i].cAt = orders[i].createdAt.toDateString();
			}
			res.locals.orders = orders;
			order.friendsActivity(res.locals.user.friends, (err, data) => {
				res.locals.friendsActivity = data;
				res.render('user/index');
			});
		});
	} else {
		res.render('index');
	}
});

router.get('/logout', (req, res) => {
	res.cookie('token', '', {expires: new Date(0)});
	res.redirect('/');
});

router.post('/login', (req, res) => {
	user.token(req.body['user-email'], req.body['user-pass'], function(token) {
		if (token != null) {
			res.cookie('token', token);
			res.redirect('/');
		} else {
			res.redirect('/?err=data');
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
post(upload.single('user-img'), (req, res) => {
	if (!req.file) req.file = {filename: ''};
	user.register(
		req.body['user-name'],
		req.body['user-email'],
		req.body['user-pass'],
		req.body['user-pass-conf'],
		req.file.filename,
		function (err) {
			if(!err)
			{
				res.redirect('/');
			}
			else
			{
				res.redirect('/register?err=data');
			}
		}
	);
});

router.route('/forgot-pass').
get((req, res) => {
	res.render('auth/forgot-pass');
}).
post((req, res) => {
	user.forgotPassword(req.body['user-email']);
	res.redirect('/');
});

router.route('/change-pass').
get((req, res) => {
	res.locals.layout = 'guest';
	res.render('auth/change-pass');
}).
post((req, res) => {
	user.changePassword(
		req.body['user-email'],
		req.body['user-pass-old'],
		req.body['user-pass'],
		req.body['user-pass-conf'],
		(err) => {
			if (!err) {
				res.redirect('/');
			} else {
				res.redirect('/change-pass?err=data');
			}
		}
	);
});

router.route('/change-img').
get((req, res) => {
	res.render('user/change-img');
}).
post(upload.single('user-img'), (req, res) => {
	if (!req.file) req.file = {filename: ''};
	user.changeImage(
		res.locals.user,
		req.file.filename,
		(err) => {
			if (!err) {
				res.redirect('/profile');
			}
		}
	);
});

router.get('/profile', (req, res) => {
	res.render('user/profile');
});

router.use((req, res, next) => {
	if (!res.locals.user && !req.url.startsWith('/assets')) {
		res.redirect('/');
	} else {
		next();
	}
});

router.get('/user/:friendID',(req, res) =>{
	user.get(req.params.friendID,function (friend) {
		res.render('user/friend-profile',{friend: friend});
	});
});

router.get('/user/:friendID/delete', (req, res) => {
	user.removeFriend(res.locals.user, req.params.friendID);
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
	user.addFriend(
		res.locals.user._id,
		req.body['add-friend'],
		function () {
			res.redirect('/friends');
		}
	);
});

router.route('/groups').
get((req, res) => {
	res.render('user/groups');
}).
post((req, res) =>{
	user.createGroup(
		res.locals.user._id,
		req.body['add-group']
	);
	res.redirect('/groups');
});

router.route('/group/:groupID').
get((req, res) => {
	user.listFriends(res.locals.user.groups[req.params.groupID], (err, members) => {
		res.render('user/group', {
			groupID: req.params.groupID,
			members: members
		});
	});

}).
post((req, res) => {
	if (req.body['add-group-submit']) {
		user.createGroup(
			res.locals.user._id,
			req.body['add-group']
		);
		res.redirect('/groups');
	} else if(req.body['group-add-friend-submit']) {
		user.addToGroup(res.locals.user, req.params.groupID, req.body['group-add-friend'], function() {
			res.redirect('/group/'+req.params.groupID);
		});
	}
});

router.get('/group/:groupID/delete', (req, res) => {
	user.deleteGroup(res.locals.user._id, req.params.groupID);
	res.redirect('/groups');
});

router.get('/group/:groupID/:friendID/remove', (req, res) => {
	user.removeFromGroup(res.locals.user._id, req.params.groupID, req.params.friendID, () => {
		res.redirect('/group/'+req.params.groupID);
	});
});

router.get('/orders', (req, res) => {
	order.listOrders(res.locals.user._id, res.locals.user.orders, (err, data) => {
		for (var i in data) {
			var invited = 0;
			var joined = 0;
			for (var usr in data[i].requests) {
				invited++;
				if (data[i].requests[usr] == 'accepted') {
					joined++;
				}
			}
			data[i].invited = invited;
			data[i].joined = joined;
		}
		res.render('user/orders', {orders: data});
	});
});

router.route('/order/:orderID').
get((req, res) => {
	order.get(res.locals.user._id, req.params.orderID, (order) => {
		if (order &&
			(
				order.owner == res.locals.user._id ||
				order.requests[Buffer(res.locals.user._id).toString('base64')] == 'accepted'
			)
		) {
			if (order.status == 'waiting') {
				var userIds = [order.owner];
				for (var userId of Object.keys(order.requests)) {
					userId = new Buffer(userId, 'base64').toString();
					userIds.push(userId);
				}
				user.listFriends(userIds, (err, users) => {
					var userObjs = {};
					for (var i = 0; i < users.length; i++) {
						userObjs[users[i]._id] = users[i];
					}
					var invited = [];
					var invitedCnt = 0;
					var joined = [];
					var joinedCnt = 0;

					for (var buId in order.requests) {
						var uId = new Buffer(buId, 'base64').toString();
						invited.push(userObjs[uId]);
						invitedCnt++;
						if (order.requests[buId] == 'accepted') {
							joined.push(userObjs[uId]);
							joinedCnt++;
						}
					}
					for (var k = 0; k < order.orders.length; k++) {
						order.orders[k].user = userObjs[order.orders[k].owner];
					}
					res.render('user/order', {
						order: order,
						invited: invited,
						invitedCnt: invitedCnt,
						joined: joined,
						joinedCnt: joinedCnt
					});
				});
			} else {
				var orders = {};
				var totalPrice = 0;
				for (var o of order.orders) {
					totalPrice += o.price;
					if (orders[o.item]) {
						orders[o.item].amount += o.amount;
						orders[o.item].price += o.price;
						if (o.comment) {
							if (orders[o.item].comment) {
								orders[o.item].comment += '<br>' + o.owner + ': ' + o.comment;
							} else {
								orders[o.item].comment = o.comment;
							}
						}
					} else {
						orders[o.item] = {
							item: o.item,
							amount: o.amount,
							price: o.price,
							comment: o.owner + ': ' + o.comment
						};
					}
				}
				var oNew = [];
				for (var i in orders) {
					oNew.push(orders[i]);
				}
				res.render('user/order-sum', {orders: oNew, totalPrice: totalPrice});
			}
		} else {
			res.redirect('/orders');
		}
	});
}).
post((req, res) => {
	order.addItem(
		res.locals.user._id,
		req.params.orderID,
		req.body['order-item'],
		req.body['order-amount'],
		req.body['order-price'],
		req.body['order-comment'],
		() => {
			// TODO handle error
			res.redirect('/order/'+req.params.orderID);
		}
	);
});

router.get('/order/:orderID/:itemID/delete', (req, res) => {
	order.deleteItem(res.locals.user._id, req.params.orderID, req.params.itemID, () => {
		res.redirect('/order/'+req.params.orderID);
	});
});

router.get('/order/:orderID/accept', (req, res) => {
	order.accept(res.locals.user, req.params.orderID);
	res.redirect('/order/'+req.params.orderID);
});

router.route('/order-new').
get((req, res) => {
	res.render('user/order-new');
}).
post(upload.single('order-menu-img'), (req, res) => {
	if (!req.file) req.file = {filename: ''};
	order.create(
		res.locals.user,
		req.body['order-type'],
		req.body['order-restaurant'],
		req.body['order-friends'].split(','),
		req.file.filename,
		(err, orderID) => {
			if (!err) {
				res.redirect('/order/'+orderID);
			} else {
				res.redirect('/orders');
			}
		}
	);
});

router.get('/order/:orderID/finish',(req, res) => {
	order.finish(res.locals.user._id,req.params.orderID);
	res.redirect('/order/'+req.params.orderID);
});

router.get('/order/:orderID/cancel',(req, res) => {
	order.cancel(res.locals.user._id,req.params.orderID);
	res.redirect('/orders');
});

router.get('/order-sum', (req, res) => {
	res.render('user/order-sum');
});

router.get('/notifications', (req, res) => {
	res.render('user/notifications');
});

/* EXPORTING */
module.exports = router;
