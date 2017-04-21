var user = require('./user');

var sio = null;
var connections = {};

module.exports = {
	serve: function(sioNew) {
		sio = sioNew;

		sio.on('connection', (sock) => {
			//Add listener to emited events here

			sock.on('token', function(token){
				var arr = Object.keys(connections);
				if(!arr.includes(user.userEmail(token))){
					connections[user.userEmail(token)] = [];
					connections[user.userEmail(token)].push(sock);
				}
				else{
					connections[user.userEmail(token)].push(sock);
				}
			});

			sock.on('disconnect', function(){
				var arr = Object.keys(connections);
				for(var email in arr){
					if(connections[arr[email]].includes(sock)){
						var i = connections[arr[email]].indexOf(sock);
						connections[arr[email]].splice(i, 1);
					}
				}
			});

		});
	},

	send: function(notification,invited){
		var arr = Object.keys(connections);
		for (var friend in invited)
			if(arr.includes(invited[friend]))
				for(var sock in connections[invited[friend]])
					connections[invited[friend]][sock].emit('notification', notification);
	},

	sendJoinReq: function(notification,invited){
		this.send(notification, invited);
	},

	// TODO merge with sendJoinReq (take permission to do so :p)
	sendOrderAccept: function(notification, invited){
		this.send(notification, invited);
	},

	notifyFinishedOrder: function(notification , notified){
		this.send(notification, notified);
	},

	//TODO emit only to invited
	notifyCancelledOrder: function(notification , notified){
		this.send(notification, notified);
	},

	newFriendActivity: function(notification , notInvitedFriends){
		this.send(notification, notInvitedFriends);
	},

	listConnections: function(){
		return connections;
	}
};
