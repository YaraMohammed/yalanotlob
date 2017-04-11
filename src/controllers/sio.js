var user = require('./user');

var sio = null;
var connections = {};

module.exports = {
	serve: function(sioNew) {
		sio = sioNew;

		sio.on('connection', (sock) => {
			console.log('connected');
			//Add listener to emited events here

			sock.on('token', function(token){
				connections[user.userEmail(token)] = sock;
			})

			sock.on('confirm',function(data) {
				console.log(data);
			});

		});
	},

	sendJoinReq: function(notification,invited){
		var arr = Object.keys(connections);
		for (var friend in invited){
			if(arr.includes(invited[friend]))
				connections[invited[friend]].emit('notification', notification);
	}
	},

	sendNotification: function(notification){
		sio.emit('notification', notification);
	},

	newFriendActivity: function(data){
		sio.emit('newFriendActivity', data);
	},

	listConnections: function(){
		return connections;
	}
};
