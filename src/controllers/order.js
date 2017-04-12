var Order = require('../models/order');
var User = require('../models/user');
var socket = require('./sio');


module.exports = {
	// create new order functions
	create: function(user, type, restaurant, friends, menuImageUrl, cb)
	{
		var reqs = {};
		for (var friend of friends)
		{
			if (user.friends.indexOf(friend) != -1)
			{
				reqs[Buffer(friend).toString('base64')] = 'waiting';
			}
		}
		console.log('Reqs', reqs);
		var order = new Order(
			{
				owner: user._id,
				type: type,
				restaurant: restaurant,
				requests: reqs,
				menuImageUrl: menuImageUrl,
				orders: [],
				status: 'waiting'
			}
		);
		order.save(function(err,data)
		{
			if(!err)
			{
				console.log(data);
				for(var key in reqs)
				{
					if(reqs.hasOwnProperty(key))
					{
						var id = data._id;
						var uid = new Buffer(key, 'base64').toString('ascii');
						User.findOneAndUpdate({'_id': uid},{$addToSet: {'orderRequests': id}}, function(err) {
							console.log(err);
						});

						User.findOneAndUpdate({'_id': user._id},{$addToSet: {'orders': id}},function (err) {
							console.log(err);
						});

					}
				}
				cb(null, data._id);
			}
			else
			{
				console.log(err);
				cb(err);
			}

		});
	},

	// get order details
	get: function(userEmail, orderID, cb)
	{
		Order.findOne(
			{
				'_id': orderID
			}, (err, order) => {
			cb(order);
		}
	);
	},

	// get order requests' details
	getOrderRequests: function(userEmail, orderRequestIds, cb) {
		Order.find({'_id': {$in: orderRequestIds}}, (err, data) => {
			for (var id in data) {
				data[id].requests = data[id].requests[Buffer(userEmail).toString('base64')];
			}
			cb(data);
		});
	},

	// accept order invitation
	accept: function(userEmail, orderID)
	{
		Order.findOne(
			{
				'_id': orderID
			}, (err, order) => {
			userEmail = new Buffer(userEmail).toString('base64');
			if (order.requests[userEmail] == undefined)
			{
				throw 'Error';
			}
			else
			{
				var criteria = 'requests.'+userEmail;
				var oReq = {};
				oReq[criteria] = 'accepted';
				console.log(oReq);
				Order.update({'_id': orderID},{$set:oReq}, (err) => {
					console.log(err);
				});
				userEmail = new Buffer(userEmail, 'base64').toString('ascii');
				User.findOneAndUpdate({'orderRequests': orderID , '_id': userEmail},{$addToSet:{'orders':orderID}}, function(err) {
					console.log(err);
				});
			}
		}
	);
	},

	// add an item to order
	addItem: function(userEmail, orderID, item, amount, price, comment, cb)
	{
		var itoma = {
			owner: userEmail,
			item: item,
			amount: amount,
			price: price,
			comment: comment
		};
		Order.findOne({'_id': orderID},function (err, data) {
			if(!err && data && data.status == 'waiting')
			{
				Order.update({'_id': orderID},{$push:{'orders':itoma}},function (err,data)
				{
					if(!err)
					{
						console.log(data);
					}
					else
					{
						console.error(err);
					}
					cb(err);
				});

			}
			else
			{
				cb(err);
			}

		});
	},

	deleteItem: function (userEmail, orderID, itemID, cb) {
		console.log('itemId',itemID);

		Order.findOne({'_id': orderID,'orders._id': itemID},function (err,data) {
			if(!err)
			{
				var item = null;
				for (var i of data.orders) {
					if (i._id == itemID) {
						item = i;
						break;
					}
				}
				console.log(item,userEmail);
				if(item && item.owner == userEmail)
				{
					Order.update({'_id': orderID},{$pull: {'orders':{'_id': itemID}}},function (err,data) {
						console.log(err);
						cb(null,data);

					});
				} else {
					cb('Cannot delete item');
				}
			}
			else
			{
				cb(err);
			}
		});


	},

	// change order status to finished
	finish: function(userEmail, orderID)
	{
		Order.findOneAndUpdate({'_id': orderID, 'owner': userEmail},{$set:{'status': 'finished'}},function (err,data)
		{
			if(!err)
			{
				console.log(data);
			}
		}
	);
	},

	// change order status to cancelled
	cancel: function(userEmail, orderID)
	{

		Order.remove({'_id':orderID, 'owner': userEmail, 'status': 'waiting'},function (err,data)
		{
			if(!err)
			{
				console.log(data);
			}
		}
	);
	},

	// lists 5 recent orders
	latestOrders: function(userEmail, orderIds, cb)
	{
		Order.find({'_id': {$in: orderIds}},function(err,data)
		{
			if(!err)
			{
				cb(data);
			}
		}).
		limit(5).
		sort({createdAt: -1});
	},

	// list all user orders
	listOrders: function (userEmail, orderIds, cb)
	{
		Order.find({'_id': {$in: orderIds}},function (err, data) {
			if(!err)
			{
				cb(null, data);
			}
			else cb(err);
		});
	},

	// lists friends activity
	friendsActivity: function(friendsEmails, cb) {
		Order.find({owner: {$in: friendsEmails}}, (err, data) => {
			cb(err, data);
		});
		// Map Reduce
	}
};
