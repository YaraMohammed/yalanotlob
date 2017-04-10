var sio = null;

module.exports = {
	serve: function(sioNew) {
		sio = sioNew;

		sio.on('connection', (sock) => {
			console.log("connected")
			//Add listener to emited events here

			sock.on('confirm',function(data){
			console.log(data);
			});

		});
	},

	sendNotification: function(notification){
		sio.emit('notification', notification);
	},

	broadcast: function(key, value) {
		throw 'Not yet implemented';
	}
};
