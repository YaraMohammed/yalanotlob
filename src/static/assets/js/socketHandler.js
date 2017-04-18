if(getCookie('token')){
	var socket = io.connect('http://'+server.host+':'+server.port);
	socket.on('connect', function(){
		socket.emit('token',getCookie('token'))
	});

//listen to notification
	socket.on('notification', function(data){
		console.log(data);
		if(data.type == 'orderJoinRequest' && data.senderName != undefined){
			// $('#notifications').prepend('<li id="'+data.orderID+'"><a href=/user/'+data.sender+'>'+data.senderName+' </a> has invited you to his order. <a href=/order/'+data.orderID+'/accept>Join</a></li>');
			$('#notifications-top').after('<li id="'+data.orderID+'"><a href="/order/'+data.orderID+'/accept">\
				<img class="img-circle" style="width: 50px; height: 50px" src="/uploads/'+data.senderImage+'">\
				'+data.senderName+' has invited you to his/her order. Click to Join\
			</a></li><li id="'+data.orderID+'-sep" role="separator" class="divider"></li>');
			$('#badge').html(Number($('#badge').html())+1)
		} else if (data.type == 'orderAccept') {
			// $('#notifications').prepend('<li id="'+data.orderID+'"><a href=/user/'+data.sender+'>'+data.senderName+' </a> has accepted invitation to <a href=/order/'+data.orderID+'>your order</a>.</li>');
			$('#notifications-top').after('<li id="'+data.orderID+'"><a href="/order/'+data.orderID+'">\
				<img class="img-circle" style="width: 50px; height: 50px" src="/uploads/'+data.senderImage+'">\
				'+data.senderName+' has invited you to his/her order. Joined\
			</a></li><li id="'+data.orderID+'-sep" role="separator" class="divider"></li>');
			$('#badge').html(Number($('#badge').html())+1)
		} else if (data.type == 'notifyFinished') {
			// $('#'+data.orderID).html('<li id="'+data.orderID+'"><a href=/user/'+data.orderOwner+'>'+data.senderName+' </a> has invited you to his order. <a href=/order/'+data.orderID+'>Finished</a></li>')
			$('#'+data.orderID).html('<a href="/order/'+data.orderID+'">\
				<img class="img-circle" style="width: 50px; height: 50px" src="/uploads/'+data.senderImage+'">\
				'+data.senderName+' has invited you to his/her order. Finished\
			</a>');
			if(location.pathname == '/orders'){
				location.reload();
			} else if(location.pathname == '/order/'+data.orderID){
				location.replace('/orders')
			}
		} else if (data.type == 'notifyCancelled'){
			$('#'+data.orderID).remove();
			$('#'+data.orderID+'-sep').remove();
			if(location.pathname == '/orders'){
				location.reload();
			} else if(location.pathname == '/order/'+data.orderID){
				location.replace('/orders')
			}
		} else if (data.type == 'notifyFriend'){
			$('#activity').prepend("<h4><dl><dt><a href=/user/"+data.sender+'><span class="label label-primary">'+data.senderName+'</span></a></dt><dd>- has created an order for '+data.orderType+ ' from ' + data.restaurant+'</dd></dl></h4>')
		}
	});
}

$('#notificate').on('click',function(){
	$('#badge').html('');
})
