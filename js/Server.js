var wh = {
	Event: {
		callStacks: {},

		bind: function(signal, func, self){
			if(!wh.Event.callStacks[signal]){
				wh.Event.callStacks[signal] = [];
			}
			wh.Event.callStacks[signal].push({func:func, self:self, once: false});
		},

		bindOnce: function(signal, func, self){
			if(!wh.Event.callStacks[signal]){
				wh.Event.callStacks[signal] = [];
			}
			wh.Event.callStacks[signal].push({func:func, self:self, once: true});
		},

		unbind: function(signal, func, self){
			if(!wh.Event.callStacks[signal]){return;}
			wh.Event.callStacks[signal].splice(wh.Event.callStacks[signal].indexOf(func), 1);
			if(wh.Event.callStacks[signal].length == 0){
				wh.Event.callStacks[signal] = null;
			}
		},

		destroy: function(signal){
			wh.Event.callStacks[signal] = null;
		},

		call: function(signal, data){
			if(window["debug"]) console.log("call: " + signal, data);

			if(!wh.Event.callStacks[signal]){return;}
			var eves = wh.Event.callStacks[signal];
			for(var i = 0; i < eves.length; i++){
				var e = eves[i];
				e.func.call(e.self, data);
				if(e.once){
					eves.splice(i, 1);
					i--;
				}
			}

			if(eves.length == 0){
				wh.Event.destroy(signal);
			}
		}
	},

	Server: {
		address: "ws://localhost:8080/TestServer/server",
		socket: null,
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		connect: function(){
			wh.Server.socket = new WebSocket(wh.Server.address);
			if(window["debug"]) console.log("正在连接至服务器...");
			wh.Server.socket.onopen = function(event){
				wh.Server.socket.onmessage = wh.Server.onMessage;
				wh.Server.socket.onclose = wh.Server.onClose;
				wh.Server.onOpen(event);
			};
		},

		onOpen: function(event){
			if(window["debug"]) console.log("成功连接到服务器。");
			wh.Event.call("$OPEN");
		},

		onMessage: function(event){
			var decodedMsg = wh.Server.decode(event.data);
			if(window["debug"]) console.log("收到消息:\n" + decodedMsg);
			var data = JSON.parse(decodedMsg);
			var key = data.k;
			if(key){
				var msg = data.v;
				if(msg){
					wh.Event.call(key, msg);
				}else{
					wh.Event.call(key);
				}
			}
		},

		onClose: function(event){
			if(window["debug"]) console.log("从服务器断开:" + event.data);
			wh.Event.call("$CLOSE", event.data);
		},

		send: function(type, data){
			var pack = {"k": type, "v": data};
			var packStr = wh.Server.encode(JSON.stringify(pack));
			wh.Server.socket.send(packStr);
		},

		_send: function(msg){
			wh.Server.socket.send(msg);
		},

		encode: function (input) {
			 var output = "";
			 var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			 var i = 0;
			 input = wh.Server._utf8_encode(input);
			 while (i < input.length) {
				  chr1 = input.charCodeAt(i++);
				  chr2 = input.charCodeAt(i++);
				  chr3 = input.charCodeAt(i++);
				  enc1 = chr1 >> 2;
				  enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				  enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				  enc4 = chr3 & 63;
				  if (isNaN(chr2)) {
						enc3 = enc4 = 64;
				  } else if (isNaN(chr3)) {
						enc4 = 64;
				  }
				  output = output +
				  wh.Server._keyStr.charAt(enc1) + wh.Server._keyStr.charAt(enc2) +
				  wh.Server._keyStr.charAt(enc3) + wh.Server._keyStr.charAt(enc4);
			 }
			 return output;
		},

		decode: function (input) {
			 var output = "";
			 var chr1, chr2, chr3;
			 var enc1, enc2, enc3, enc4;
			 var i = 0;
			 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			 while (i < input.length) {
				  enc1 = wh.Server._keyStr.indexOf(input.charAt(i++));
				  enc2 = wh.Server._keyStr.indexOf(input.charAt(i++));
				  enc3 = wh.Server._keyStr.indexOf(input.charAt(i++));
				  enc4 = wh.Server._keyStr.indexOf(input.charAt(i++));
				  chr1 = (enc1 << 2) | (enc2 >> 4);
				  chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				  chr3 = ((enc3 & 3) << 6) | enc4;
				  output = output + String.fromCharCode(chr1);
				  if (enc3 != 64) {
						output = output + String.fromCharCode(chr2);
				  }
				  if (enc4 != 64) {
						output = output + String.fromCharCode(chr3);
				  }
			 }
			 output = wh.Server._utf8_decode(output);
			 return output;
		},

		_utf8_encode: function (string) {
			 string = string.replace(/\r\n/g,"\n");
			 var utftext = "";
			 for (var n = 0; n < string.length; n++) {
				  var c = string.charCodeAt(n);
				  if (c < 128) {
						utftext += String.fromCharCode(c);
				  } else if((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
				  } else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
				  }

			 }
			 return utftext;
		},

		_utf8_decode: function (utftext) {
			 var string = "";
			 var i = 0;
			 var c = c1 = c2 = 0;
			 while ( i < utftext.length ) {
				  c = utftext.charCodeAt(i);
				  if (c < 128) {
						string += String.fromCharCode(c);
						i++;
				  } else if((c > 191) && (c < 224)) {
						c2 = utftext.charCodeAt(i+1);
						string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
						i += 2;
				  } else {
						c2 = utftext.charCodeAt(i+1);
						c3 = utftext.charCodeAt(i+2);
						string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
						i += 3;
				  }
			 }
			 return string;
		}
	}
}
