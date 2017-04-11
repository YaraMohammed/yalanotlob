var Order = require('../models/order');
var User = require('../models/user');
var socket = require('./sio');


module.exports = {
	// create new order functions
	create: function(userEmail, type, restaurant, friends, menuImageUrl, cb)
	{
		var reqs = {};
		var i = 0;
		for (var friend of friends)
		{

			friend = new Buffer(friend).toString('base64');
			User.findOne({'_id': new Buffer(friend, 'base64').toString('ascii')},function (err , data)
			{
				if(data != null)
				{
					var d = data._id;
					console.log(d);
					d = new Buffer(d).toString('base64');
					console.log(d);
					console.log(data);
					reqs[d] = 'waiting';

				}
				else
				{
					console.log('Friend Email does not exist');

				}
				i++;
				if(i == friends.length)
				{
					console.log('Reqs', reqs);
					var order = new Order(
						{
							owner: userEmail,
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
									var oid = data._id;
									var orderOwner = data.owner;
									var uid = new Buffer(key, 'base64').toString('ascii');
									User.findOneAndUpdate({'_id':uid},{$addToSet:{'orderRequests':oid}}, function(err) {
										console.log(err);
									});
									User.findOneAndUpdate({'_id': orderOwner},{$addToSet:{'orders':oid}},function (err) {
										console.log(err);
									});

								}
							}
							cb(null, data._id);
						} else {
							cb(err);
						}

					}
				);
				}
			});
		}

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
		Order.findOneAndUpdate({'_id': orderID},{$push:{'orders':itoma}},function (err,data)
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
		}
	);
	},

	deleteItem: function (userEmail, orderID, itemID, cb) {
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
				if(item && item.owner == userEmail)
				{
					console.log(userEmail);
					Order.update({'owner':userEmail},{$pull: {'orders':{'_id': itemID}}},function (err,data) {
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
		Order.remove({'_id':orderID, 'owner': userEmail},function (err,data)
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
