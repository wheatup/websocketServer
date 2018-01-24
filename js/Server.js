if(!wh){
	var wh = {};
}
wh.Server = {
	address: "ws://localhost:8080/TestServer/server",
	socket: null,

	connect: function(){
		wh.Server.socket = new WebSocket(wh.Server.address);
		console.log("正在连接至服务器...");
		wh.Server.socket.onopen = function(event){
			wh.Server.socket.onMessage = wh.Server.onMessage;
			wh.Server.socket.onClose = wh.Server.onClose; 
			wh.Server.onOpen(event);
		};
	},

	onOpen: function(event){
		console.log("成功连接到服务器。");
		wh.Event.call("OnOpen");
	},

	onMessage: function(event){
		console.log("收到消息:\n" + event.data);
		wh.Event.call("OnMessage", event.data);
	},

	onClose: function(event){
		console.log("从服务器断开:" + event.data);
		wh.Event.call("OnClose", event.data);
	},

	send: function(msg){
		wh.Server.socket.send(msg); 
	}
};
