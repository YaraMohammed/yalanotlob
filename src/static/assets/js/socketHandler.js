  var socket = io.connect("http://"+server.host+":"+server.port);
  socket.on('connect', function(){
  	console.log("connected");
  });
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
