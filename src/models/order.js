/* LIBs */
var mongoose = require('mongoose');

/* SCHEMA */
var schema = new mongoose.Schema({
	owner: String,
	type: {
		type: String,
		enum: ['Breakfast', 'Lunch','Dinner']
	},
	restaurant: String,
	requests: [{
		user: String,
		status: {
			type: String,
			enum: ['waiting', 'accepted']
		}
	}],
	menuImage: String,
	orders: [{
		owner: String,
		item: String,
		amount: Number,
		price: Number,
		comment: String
	}],
	status: {
		type: String,
		enum: ['waiting', 'finished']
}, timestamps: {
	createdAt: 'createdAt',
	updatedAt: 'updatedAt'
});

/* EXPORTING */
module.exports = mongoose.model('orders', schema);
