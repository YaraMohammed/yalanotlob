var userModel = require('../models/user');
var jwt = require('jsonwebtoken');
var sendmail = require('sendmail')();
var generator = require('generate-password');
var config = require('../config');

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
			userModel.findOne({'_id': userEmail}, function (err, data) {
				if(!data)
				{
					newUser.save(function(err,data){
						if(!err){
							console.log(data);
							cb(null);
						} else {
							console.log(err);
							cb(err);
						}
					});
				}
				else
				{
					console.log('User Already Exist');
					cb('User Already Exist');
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

	//Change Password
	changePassword: function (userEmail, oldPass, newPass, confPass, cb) {
		console.log('ay 7aga');
		userModel.findOne({'_id': userEmail}, function (err, data) {
			if(data && newPass == confPass && data.password == oldPass)
			{
				userModel.update({'_id': data._id}, {$set: {'password': newPass}}, function (err) {
					cb(err);
				});
			} else {
				cb('Wrong Data');
			}
		});
	},

	//Forget password
	forgotPassword: function (userEmail) {
		userModel.findOne({'_id': userEmail}, function (err, data) {
			if(data)
			{
				var password = generator.generate({
					length: 6,
					numbers: true
				});
				console.log('pass',password);
				userModel.update({'_id': data._id}, {$set: {'password': password}}, function (err) {
					console.log(err);
				});
				sendmail({
					from: ' yalaNotlob <noreply@yalaNotlob.com>',
					to: userEmail,
					subject: 'Reset password',
					html: 'Your new password is '+password+'<br>'+
					'<a href="http://'+config.app.host+':'+config.app.port+'/change-pass">Change Password</a>',
				}, function(err, reply) {
					console.log(err && err.stack);
					console.dir(reply);
				});
			}
			else
			{
				console.log(err);
			}
		});
	},

	//Change imageUrl
	changeImage: function (userEmail,imageUrl, cb) {
		console.log('ay habl');
		userModel.findOne({'_id': userEmail}, function (err, data) {
			if(data)
			{
				userModel.update({'_id': data._id}, {$set: {'imageUrl': imageUrl}}, function (err) {
					cb(err);
				});
			} else {
				cb('Wrong Data');
			}
		});
	},

	// add new friend
	addFriend: function(userEmail, friendEmail,cb) {
		if(userEmail == friendEmail)
		{
			cb('You can not add yourself');
		}
		else{
			// check if friend email exist
			userModel.findById(friendEmail, function(err, data) {
				if (err || !data) cb(err);
				// check if the friend already added
				else
				{
					userModel.findOne({ _id: userEmail, friends: friendEmail}, function(err, data) {
						if (data == null){
							//  add friend in user friends list
							userModel.findOneAndUpdate({ _id: userEmail },{$addToSet: { friends: friendEmail }} , function(err, data) {
								if (err) cb(err);
								cb(null,data);
							});
						}else{
							cb('Friend Already Exists');
						}
					});
				}
			});
		}
	},

	// remove friend
	removeFriend: function(user, friendEmail) {
		userModel.findOneAndUpdate({ _id: user._id }, { $pull: { friends: friendEmail } }, function(err, data) {
			if (err) throw err;
			console.log(data);
		});
		for (var group in user.groups) {
			this.removeFromGroup(user._id, group, friendEmail, () => {});
		}
	},

	// create new group
	createGroup: function(userEmail, groupName) {
		if(groupName.indexOf('/') == -1 && groupName.indexOf('\\') == -1){
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
		}
		else
			console.log('invalid name');
	},

	// delete a group
	deleteGroup: function(userEmail, groupName) {
		var groupCriteria =  'groups.'+groupName;
		var q = {_id: userEmail};
		q[groupCriteria] = {$exists: true};
		console.log(q);
		userModel.findOne(q, function(err, data) {
			if (data != null){
				//  add friend in user friends list
				var q = {};
				q['groups.'+groupName] = [];
				console.log(q);
				userModel.update({_id: userEmail},{$unset: q}, function(err, data) {
					if (err) throw err;
					console.log(data);
				});
			}else{
				console.log(err);
			}
		});
	},

	// add new member to group
	addToGroup: function(user, groupName, friendEmail, cb) {
		if (user.friends.indexOf(friendEmail) == -1 || friendEmail == user._id) {
			console.log('WRONG');
			cb('Cannot add user to group');
			return;
		}
		var q = {};
		q['groups.'+groupName] = friendEmail;
		userModel.findOneAndUpdate({'_id': user._id}, {$addToSet: q}, (err) => {
			cb(err);
		});
	},

	// remove member from group
	removeFromGroup: function(userEmail, groupName, friendEmail, cb) {
		var q = {};
		q['groups.'+groupName] = friendEmail;
		userModel.findOneAndUpdate({'_id': userEmail}, {$pull: q}, (err) => {
			cb(err);
		});
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
