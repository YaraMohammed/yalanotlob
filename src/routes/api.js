/* LIBs */
var express = require('express');
var cookieParser = require('cookie-parser');
var user = require('../controllers/user');

/* VARs */
var router = express.Router();

/* ROUTING */
router.get('/get-users/:entity_id', cookieParser(), (req, res) => {
	user.get(req.params['entity_id'], (u) => {
		if (u) {
			res.json([u]);
		} else {
			var email = user.userEmail(req.cookies.token);
			if (email) {
				user.get(email, (u) => {
					if (u && u.groups && u.groups.hasOwnProperty(req.params['entity_id'])) {
						user.listFriends(u.groups[req.params['entity_id']], (err, u) => {
							res.json(u);
						});
					} else {
						res.json([]);
					}
				});
			} else {
				res.json([]);
			}
		}
	});
});

/* EXPORTING */
module.exports = router;
