if(getCookie('token')){
  var socket = io.connect("http://"+server.host+":"+server.port);
  socket.on('connect', function(){
    socket.emit('token',getCookie('token'))
  });

  //listen to notification
  socket.on('notification', function(data){
  	// socket.emit('confirm','notificationRecieved');
    if(data.type == 'orderJoinRequest' && data.senderName != undefined){
      $('#notifications').prepend("<li><a href=/user/"+data.sender+">"+data.senderName+" </a> has invited you to his order<a href=/order/"+data.orderID+"/accept>JoinXX</a></li>")
    }
  });

  socket.on('newFriendActivity', function(data){
  	console.log(data);
  });

  socket.on('disconnect', function(){});
}
