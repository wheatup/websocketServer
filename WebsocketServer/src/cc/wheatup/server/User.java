package cc.wheatup.server;

import javax.websocket.Session;

import cc.wheatup.util.Util;

public class User {
	public Session session;
	public long uuid = 0;
	
	public User(Session session){
		this.session = session;
		this.uuid = Server.CURRENT_USID;
		Server.CURRENT_USID++;
	}
	
	public void send(Pack pack){
		try{
			String text = pack.toJSON().toString();
			String encodeText = Util.encode(text);
			session.getAsyncRemote().sendText(encodeText);
		}catch(Exception e){
			
		}
	}
	
	public void logoff(){
		
	}
}
