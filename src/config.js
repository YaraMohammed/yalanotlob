module.exports = {
	'app': {
		'port': 8888
	},
	'database': {
		'hostname' : 'localhost' ,
		'port' : 27017 ,
		'name' : 'yalaNotlob'
	},
	'fbAuth':{
		'appID': '1790717444579771',
		'appSecret': 'd4ac8c1a59a04e4484673025c3b4d5e3',
		'callbackUrl': 'http://localhost:8888/login/facebook/callback'
	},
	'googleAuth':{
		"client_id":"891495422803-1k89d5vfse7pjjdh3cusd04ilqhifbip.apps.googleusercontent.com",
		"project_id":"yalanotlob-163721",
		"auth_uri":"https://accounts.google.com/o/oauth2/auth",
		"token_uri":"https://accounts.google.com/o/oauth2/token",
		"auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
		"client_secret":"KsworCzD2l5uuuWe918DYAxF",
		"redirect_uris":["http://localhost:8888/login/google/callback"],
		"javascript_origins":["http://localhost:8080"]
	}
};
