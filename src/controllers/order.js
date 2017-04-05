var express = require('express');
var mongoose = require('mongoose');
var Order = require('../models/order');

module.exports = {
	// create new order functions
	create: function(userEmail, type, restaurant, friends, menuImageUrl) {
		var reqs;
		for (friend of friends) {
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

	// accept order invitation
	accept: function(userEmail, orderID) {
		Order.findOne({
			'_id': orderID
		}, (err, order) => {
			if (order.requests[userEmail] == undefined)
			{
				throw Exception();
			}
			else
			{
				order.requests[userEmail] = 'accepted';
			}
		});
	},

	// add an item to order
	addItem: function(userEmail, orderID, item, amount, price, comment) {

		var item ={
			owner: userEmail,
		  item: item,
	 		amount: amount,
	 		price: price,
			comment: comment
		};
		Order.findOneAndUpdate({'_id': orderID},{$set:{$push:{'orders':item}}},function (err,data) {
			if(!err){
				console.log(data);
			}else{
				console.error(err);
			}
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
