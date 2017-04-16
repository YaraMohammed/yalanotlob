var Order = require('../models/order');
var User = require('../models/user');
var user = require('./user');
var socket = require('./sio');


module.exports = {
	// create new order functions
	create: function(user, type, restaurant, friends, menuImageUrl, cb)
	{
		var reqs = {};
		var invited = [];
		for (var friend of friends)
		{
			if (user.friends.indexOf(friend) != -1)
			{
				invited.push(friend);
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
					}
				}
				User.findOneAndUpdate({'_id': user._id},{$addToSet: {'orders': data._id}},function (err) {
					console.log(err);
					// send notification
					var notification = {'type': 'orderJoinRequest' , 'sender': user._id , 'senderName': user.name , 'orderID': data._id};
					console.log('Notification ',notification,' invited ',invited);
					socket.sendJoinReq(notification, invited);
					cb(null, data._id);
				});
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

	// get order notifications
	getNotifs: function(user, cb) {
		Order.find({'_id': {$in: user.orderRequests}}, (err, reqs) => {
			var notifs = [];
			var users = [];
			for (var req of reqs) {
				users.push(req.owner);
				notifs.push({
					type: 'req',
					user: req.owner,
					orderID: req._id,
					myStatus: req.requests[Buffer(user._id).toString('base64')],
					status: req.status,
					time: req.createdAt
				});
			}
			for (var orderID in user.orderAccepts) {
				for (var acc of user.orderAccepts[orderID]) {
					users.push(acc.user);
					acc.type = 'acc';
					acc.orderID = orderID;
					notifs.push(acc);
				}
			}
			notifs.sort((a, b) => { return a.time < b.time; });
			User.find({'_id': {$in: users}},function (err,users) {
				var userNames = {};
				for (var user of users) {
					userNames[user._id] = user.name;
				}
				for (var id in notifs) {
					notifs[id].userName = userNames[notifs[id].user];
				}
				cb(notifs);
			});
		}).sort({createdAt: -1});
	},

	// accept order invitation
	accept: function(user, orderID)
	{
		Order.findOne(
			{
				'_id': orderID
			}, (err, order) => {
			var userEmail = new Buffer(user._id).toString('base64');
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
				var notification = {'type': 'orderAccept' , 'sender': user._id , 'senderName': user.name , 'orderID': orderID};
				console.log('Notification ',notification,' invited ',[order.owner]);
				socket.sendOrderAccept(notification, [order.owner]);
				var q = {};
				q['orderAccepts.'+orderID] = {
					user: userEmail,
					time: new Date()
				};
				User.findOneAndUpdate({'_id': order.owner}, {$push: q}, (err) => {
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
			for(var key in data.requests)
			{
				if(data.requests.hasOwnProperty(key) && new Buffer(key, 'base64').toString('ascii') == userEmail)
				{
					if(!err && data && data.status == 'waiting' && data.requests[key] == 'accepted')
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
				}
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
		Order.findOne({'_id': orderID}, function (err, data) {
			if(data)
			{
				if (data.requests)
				{
					for(var i = 0 ; i< Object.keys(data.requests).length ; i++)
					{
						User.update({'orderRequests': orderID}, {$pull: {'orderRequests': orderID, 'orders': orderID}}, function (err) {
							console.log(err);
						});
					}
				}
				Order.remove({'_id':orderID, 'owner': userEmail, 'status': 'waiting'},function (err,data)
				{
					if(!err)
					{
						console.log(data);
					} else {
						console.log(err);
					}
				});
				var q = {};
				q['orderAccepts.'+orderID] = [];
				User.findOneAndUpdate({'_id': data.owner}, {$unset: q}, function (err) {
					console.log(err);
				});
			}
			else {
				console.log('error',err);
			}
		});
		User.findOneAndUpdate({'orders': orderID}, {$pull: {'orders': orderID}}, function (err) {
			console.log(err);
		});
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
			user.listFriends(friendsEmails, (err, friends) => {
				var fObj = {};
				for (var friend of friends) {
					fObj[friend._id] = friend.name;
				}
				for (var id in data) {
					data[id].name = fObj[data[id].owner];
				}
				cb(err, data);
			});
		});
		// Map Reduce
	}
};
