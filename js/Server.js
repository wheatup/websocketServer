if(!wh){
	var wh = {};
}
wh.Server = {
	address: "ws://192.168.16.45:8080/TestServer/server",
	socket: null,

	connect: function(){
		Server.socket = new WebSocket(Server.address);
		console.log("正在连接至服务器...");
		Server.socket.onopen = function(event){
			Server.socket.onMessage = Server.onMessage;
			Server.socket.onClose = Server.onClose; 
			Server.onOpen(event);
		};
	},

	onOpen: function(event){
		console.log("成功连接到服务器。");
		Event.call("OnOpen");
	},

	onMessage: function(event){
		console.log("收到消息:\n" + event.data);
		Event.call("OnMessage", event.data);
	},

	onClose: function(event){
		console.log("从服务器断开:" + event.data);
		Event.call("OnClose", event.data);
	},

	send: function(msg){
		Server.socket.send(msg); 
	}
};
