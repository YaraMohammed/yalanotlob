/* LIBs */
var express = require('express');

/* VARs */
var router = express.Router();

/* ROUTING */
router.use((req, res, next) => {
	res.locals.title = 'Yala Notlob';
	next();
});

router.get('/', (req, res) => {
	res.render('index');
});

router.route('/login').
get((req, res) => {
	res.render('auth/login');
}).
post(() => {
	throw 'Not yet implemented';
});

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
