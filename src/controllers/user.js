var userModel = require('../models/user');
var jwt = require('jsonwebtoken');

module.exports = {

	// register a new user
	register: function(userName, userEmail, userPassword, imageUrl) {
		var newUser = new userModel({
			_id: userEmail,
			name: userName,
			password: userPassword,
			imageUrl: imageUrl
		});
		newUser.save(function(err,data){
			if(!err){
				console.log(data);
			}
		});
	},

	// user login
	token: function(userEmail, password,cb) {
		userModel.findOne({'_id': userEmail , 'password': password},function (err, data) {
			if(data != null){
				var token = jwt.sign({ '_id': userEmail }, 'secret', { algorithm: 'HS256'});
				cb(token);
			}
			else {
				cb(null);
			}
		});
	},

	// to know the token owner
	userEmail: function(token) {
		throw 'Not yet implemented';
	},

	// add new friend
	addFriend: function(userEmail, friendEmail) {
		// check if friend email exist
		userModel.findById(friendEmail, function(err) {
			if (err) throw err;
			// check if the friend already added
			userModel.findOne({ _id: userEmail, friends: friendEmail}, function(err, data) {
				if (data == null){
					//  add friend in user friends list
					userModel.findOneAndUpdate({ _id: userEmail },{$set: { $push: { friends: friendEmail }} }, function(err, data) {
						if (err) throw err;
						console.log(data);
					});
				}else{
					console.log('Friend Already Exists');
				}
			});
		});
	},

	// remove friend
	removeFriend: function(userEmail, friendEmail) {
		userModel.findOneAndUpdate({ _id: userEmail }, { $pull: { friends: friendEmail } }, function(err, data) {
			if (err) throw err;
			console.log(data);
		});
	},

	// create new group
	createGroup: function(userEmail, groupName) {
		var groupCriteria =  'groups.'+groupName;
		var q = {_id: userEmail};
		q[groupCriteria] = {$exists: true};
		userModel.findOne(q, function(err, data) {
			if (data == null){
				//  add friend in user friends list
				userModel.update({_id: userEmail},{$set:{groups:{groupName:[]}}}, function(err, data) {
					if (err) throw err;
					console.log(data);
				});
			}else{
				console.log('Group Already Exists');
			}
		});
	},

	// delete a group
	deleteGroup: function(userEmail, groupName) {
		var groupCriteria =  'groups.'+groupName;
		var q = {_id: userEmail};
		q[groupCriteria] = {$exists: true};
		userModel.findOne(q, function(err, data) {
			if (data != null){
				//  add friend in user friends list
				userModel.update({_id: userEmail},{$unset:{groupCriteria:[]}}, function(err, data) {
					if (err) throw err;
					console.log(data);
				});
			}else{
				console.log(err);
			}
		});
	},

	// add new member to group
	addToGroup: function(userEmail, groupName, friendEmail) {
		throw 'Not yet implemented';
	},

	// remove member from group
	removeFromGroup: function(userEmail, groupName, friendEmail) {
		throw 'Not yet implemented';
	},

	// list all user friends
	listFriends: function(userEmail) {
		throw 'Not yet implemented';
	}
};
