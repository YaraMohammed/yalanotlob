/* LIBs */
var mongoose = require('mongoose');

/* SCHEMA */
var schema = new mongoose.Schema({
	_id: String, // user email
	name: String,
	password: String,
	friends: [String],
	orderRequests: [String],
	groups: Object
});

/* EXPORTING */
module.exports = mongoose.model('users', schema);
