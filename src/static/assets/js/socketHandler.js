if(getCookie('token')){
  var socket = io.connect("http://"+server.host+":"+server.port);
  socket.on('connect', function(){
  	console.log("connected");
    socket.emit('token',getCookie('token'))
  });

  //listen to notification
  socket.on('notification', function(data){
  	console.log(data.type);
  	console.log(data);
  	socket.emit('confirm','notificationRecieved');
  });

  socket.on('newFriendActivity', function(data){
  	console.log(data);
  });

  socket.on('disconnect', function(){});
}
