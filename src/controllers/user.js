module.exports = {
	register: function(userName, userEmail, password) {
		throw 'Not yet implemented';
	},
	token: function(userEmail, password) {
		throw 'Not yet implemented';
	},
	userEmail: function(token) {
		throw 'Not yet implemented';
	},
	addFriend: function(userEmail, friendEmail) {
		throw 'Not yet implemented';
	},
	removeFriend: function(userEmail, friendEmail) {
		throw 'Not yet implemented';
	},
	createGroup: function(userEmail, groupName) {
		throw 'Not yet implemented';
	},
	deleteGroup: function(userEmail, groupName) {
		throw 'Not yet implemented';
	},
	addToGroup: function(userEmail, groupName, friendEmail) {
		throw 'Not yet implemented';
	},
	removeFromGroup: function(userEmail, groupName, friendEmail) {
		throw 'Not yet implemented';
	}
};
