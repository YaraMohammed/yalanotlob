/* LIBs */
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var socketIO = require('socket.io');
var handlebars = require('express-handlebars');
var config = require('./config');
var passport = require('passport');

/* VARs */
var app = express();
var server = http.Server(app);
var sio = socketIO(server);

/* INIT */
mongoose.connect('mongodb://'+config.database.hostname+':'+config.database.port+'/'+config.database.name);

require('./controllers/sio').serve(sio);

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(passport.initialize());
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/index'));

server.listen(config.app.port, () => {
	console.log('[  OK  ] listening on :' + config.app.port);
});
