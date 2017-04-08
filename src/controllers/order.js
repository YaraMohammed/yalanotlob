var Order = require('../models/order');

module.exports = {
	// create new order functions
	create: function(userEmail, type, restaurant, friends, menuImageUrl) {
		var reqs = {};
		for (var friend of friends) {
			friend = new Buffer(friend).toString('base64');
			reqs[friend] = 'waiting';
		}
		var order = new Order({
			owner: userEmail,
			type: type,
			restaurant: restaurant,
			requests: reqs,
			menuImageUrl: menuImageUrl,
			orders: [],
			status: 'waiting'
		});
		order.save(function(err,data){
			if(!err){
				console.log(data);
			}
		});
	},

	// get order details
	get: function(userEmail, orderID, cb) {
		Order.findOne({
			'_id': orderID
		}, (err, order) => {
			cb(order);
		});
	},

	// accept order invitation
	accept: function(userEmail, orderID) {
		Order.findOne({
			'_id': orderID
		}, (err, order) => {
			userEmail = new Buffer(userEmail).toString('base64');
			if (order.requests[userEmail] == undefined)
			{
				throw 'Error';
			}
			else
			{
				order.requests[userEmail] = 'accepted';
			}
		});
	},

	// add an item to order
	addItem: function(userEmail, orderID, item, amount, price, comment, cb) {

		var itoma ={
			owner: userEmail,
			item: item,
			amount: amount,
			price: price,
			comment: comment
		};
		Order.findOneAndUpdate({'_id': orderID},{$push:{'orders':itoma}},function (err,data) {
			if(!err){
				console.log(data);
			}else{
				console.error(err);
			}
			cb(err);
		});
	},

	// change order status to finished
	finish: function(userEmail, orderID) {
		Order.findOneAndUpdate({'_id': orderID, 'owner': userEmail},{$set:{'status': 'finished'}},function (err,data) {
			if(!err){
				console.log(data);
			}
		});
	},

	// change order status to cancelled
	cancel: function(userEmail, orderID) {
		Order.remove({'_id':orderID, 'owner': userEmail},function (err,data) {
			if(!err){
				console.log(data);
			}
		});
	},

	// lists 5 recent orders
	latestOrders: function(userEmail, cb) {
		Order.find({'owner': userEmail},function(err,data){
			if(!err){
				cb(data);
			}
		}).
		limit(5).
		sort({createdAt: -1});
	},
	// lists friends activity
	friendsActivity: function(friendsEmails) {
		throw 'Not yet implemented';
		// Map Reduce
	}
};
