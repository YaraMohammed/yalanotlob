if(getCookie('token')){
	var socket = io.connect('http://'+server.host+':'+server.port);
	socket.on('connect', function(){
		socket.emit('token',getCookie('token'))
	});

//listen to notification
	socket.on('notification', function(data){
		if(data.type == 'orderJoinRequest' && data.senderName != undefined){
			$('#notifications').prepend('<li><a href=/user/'+data.sender+'>'+data.senderName+' </a> has invited you to his order. <a href=/order/'+data.orderID+'/accept>Join</a></li>');
			$('#badge').html(parseInt($('#badge').html())+1)
		} else if (data.type == 'orderAccept') {
			$('#notifications').prepend('<li><a href=/user/'+data.sender+'>'+data.senderName+' </a> has accepted invitation to <a href=/order/'+data.orderID+'>your order</a>.</li>');
			$('#badge').html(parseInt($('#badge').html())+1)
		} else if (data.type == 'notifyFinished') {
			location.reload();
		} else if (data.type == 'notifyCancelled'){
			location.reload();
		} else if (data.type == 'notifyFriend'){			        
			$('#activity').prepend("<h4><dl><dt><a href=/user/"+data.sender+'><span class="label label-primary">'+data.senderName+'</span></a></dt><dd>- has created an order for '+data.orderType+ ' from ' + data.restaurant+'</dd></dl></h4>')
		}
	});
}

$('#notificate').on('click',function(){
	$('#badge').html(0);
})
