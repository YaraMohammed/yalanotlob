module.exports = {
	'app': {
		'host': '127.0.0.1',
		'port': 8888
	},
	'database': {
		'hostname': 'db',
		'port': 27017 ,
		'name': 'yalaNotlob'
	},
	'fbAuth': {
		'appID': '1790717444579771',
		'appSecret': 'd4ac8c1a59a04e4484673025c3b4d5e3',
		'callbackUrl': 'http://127.0.0.1:8888/login/facebook/callback'
	},
	'googleAuth': {
		'client_id': '891495422803-1k89d5vfse7pjjdh3cusd04ilqhifbip.apps.googleusercontent.com',
		'client_secret': 'KsworCzD2l5uuuWe918DYAxF',
		'callbackUrl': 'http://127.0.0.1:8888/login/google/callback',
	}
};
