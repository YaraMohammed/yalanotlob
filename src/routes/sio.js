var sio = null

module.exports = {
	serve: function(sioNew) {
		sio = sioNew

		sio.on('connection', (sock) => {
			throw 'Not yet implemented';
		});
	},
	broadcast: function(key, value) {
		throw 'Not yet implemented';
	}
};
