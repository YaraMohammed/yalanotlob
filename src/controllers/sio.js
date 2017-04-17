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

	sendJoinReq: function(notification,invited){
		var arr = Object.keys(connections);
		for (var friend in invited)
			if(arr.includes(invited[friend]))
				for(var sock in connections[invited[friend]])
					connections[invited[friend]][sock].emit('notification', notification);
	},

	// TODO merge with sendJoinReq (take permission to do so :p)
	sendOrderAccept: function(notification, invited){
		this.sendJoinReq(notification, invited);
	},

	notifyFinishedOrder: function(notification){
		sio.emit('notifyFinished', notification);
	},

	notifyCancelledOrder: function(notification){
		sio.emit('notifyCancelled', notification)
	},

	newFriendActivity: function(data){
		sio.emit('newFriendActivity', data);
	},

	listConnections: function(){
		return connections;
	}
};
