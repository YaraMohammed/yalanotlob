var express = require('express');
var mongoose = require('mongoose');
var userModel = require('../models/user');

module.exports = {
	// register a new user
	register: function(userName, userEmail, userPassword, imageUrl) {
		var newUser = new userModel({
			_id: userEmail,
			name: userName,
			password: userPassword,
			imageUrl: imageUrl
		});
		userModel.save(function(err,data){
      if(!err){
				console.log(data);
      }
    });
	},
	// user login
	token: function(userEmail, password) {
		throw 'Not yet implemented';
	},
	// to know the token owner
	userEmail: function(token) {
		throw 'Not yet implemented';
	},
	// add new friend
	addFriend: function(userEmail, friendEmail) {
		// check if friend email exist
		userModel.findById(friendEmail, function(err, data) {
		  if (err) throw err;
			// check if the friend already added
			userModel.find(({ _id: userEmail, friends: friendEmail}, function(err, data) {
			  if (err){
						//  add friend in user friends list
						userModel.findOneAndUpdate({ _id: userEmail }, { $push: { friends: friendEmail } }, function(err, data) {
			  			if (err) throw err;
			  			console.log(data);
						});
					}else{
						console.log("Friend Already Exists");
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
		throw 'Not yet implemented';
	},
	// delete a group
	deleteGroup: function(userEmail, groupName) {
		throw 'Not yet implemented';
	},
	// add new member to group
	addToGroup: function(userEmail, groupName, friendEmail) {
		throw 'Not yet implemented';
	},
	// remove member from group
	removeFromGroup: function(userEmail, groupName, friendEmail) {
		throw 'Not yet implemented';
	}
	// list all user friends
	listFriends: function(userEmail) {
		throw 'Not yet implemented';
	}
};
