  var socket = io.connect("http://"+server.host+":"+server.port);
  socket.on('connect', function(){
  	console.log("connected");
  });

  //listen to notification
  socket.on('notification', function(data){
  	console.log(data.type);
  	console.log(data);
  	socket.emit('confirm','notificationRecieved')
  });

  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
