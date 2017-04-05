var express = require('express');
var mongoose = require('mongoose');
var Order = require('../models/order');

module.exports = {
	// create new order functions
	create: function(userEmail, type, restaurant, friends, menuImageUrl) {
		var order = new Order({
				owner: userEmail,
				type: type,
				restaurant: restaurant,
				requests: friends,
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
		throw 'Not yet implemented';
	},
	// add an item to order
	addItem: function(userEmail, orderID, item, amount, price, comment) {
		throw 'Not yet implemented';
	},
	// change order status to finished
	finish: function(userEmail, orderID) {
		throw 'Not yet implemented';
	},
	// change order status to cancelled
	cancel: function(userEmail, orderID) {
		throw 'Not yet implemented';
	},
	// lists 5 recent orders
	latestOrders: function(userEmail) {
		Order.find({'owner': userEmail},function(err,data){
			if(!err){
				console.log(data);
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
