var userModel = require('../models/user');
var jwt = require('jsonwebtoken');

module.exports = {

	// register a new user
	register: function(userName, userEmail, userPassword, userPasswordConfirm, imageUrl, cb) {
		if ((userPassword.length>=6) && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail))&&(userPasswordConfirm == userPassword))
		{
			var newUser = new userModel({
				_id: userEmail,
				name: userName,
				fb_access_token: '',
				password: userPassword,
				friends: [],
				orderRequests: [],
				imageUrl: imageUrl,
				groups: {}
			});
			newUser.save(function(err,data){
				if(!err){
					console.log(data);
					cb(null);
				} else {
					console.log(err);
					cb(err);
				}
			});
		}else
		{
			console.log('you entered wrong data');
			cb('you entered wrong data');
		}

	},

	// get user data
	get: function(userEmail, cb) {
		userModel.findOne({
			'_id': userEmail
		}, (err, user) => {
			cb(user);
		});
	},

	// user login
	token: function(userEmail, password,cb) {
		if (!password) {
			cb(null);
			return;
		}
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
		try {
			var payload = jwt.verify(token, 'secret');
			if (payload != null) {
				return payload._id;
			}
		} catch(e) {
			return;
		}
	},

	// add new friend
	addFriend: function(userEmail, friendEmail) {
		if(userEmail == friendEmail)
		{
			console.log('You can not add yourself');
		}
		else{
			// check if friend email exist
			userModel.findById(friendEmail, function(err, data) {
				if (err || !data) console.log(err);
				// check if the friend already added
				else
				{
					userModel.findOne({ _id: userEmail, friends: friendEmail}, function(err, data) {
						if (data == null){
							//  add friend in user friends list
							userModel.findOneAndUpdate({ _id: userEmail },{$addToSet: { friends: friendEmail }} , function(err, data) {
								if (err) throw err;
								console.log(data);
							});
						}else{
							console.log('Friend Already Exists');
						}
					});
				}
			});
		}
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

		// var criteria = 'requests.'+userEmail;
		var group = {};
		group['groups.'+groupName] = [];
		userModel.findOne(q, function(err, data) {
			if (data == null){
				//  add friend in user friends list
				userModel.update({_id: userEmail},{$set:group}, function(err, data) {
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
	listFriends: function(friends,cb) {
		userModel.find({'_id':{$in:friends}},function (err,data) {
			if(!err)
			{
				cb(null,data);
			}
			else{
				cb(err);
			}
		});
	}
};
