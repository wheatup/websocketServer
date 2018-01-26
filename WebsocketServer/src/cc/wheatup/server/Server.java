package cc.wheatup.server;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import cc.wheatup.util.Util;

@ServerEndpoint("/server")
public class Server {
	private static MessageCenter currentHandler;
	private static Map<Session, User> userMap;
	private static boolean running = false;
	
	@OnOpen
	public void onOpen(Session session){
		if(!running) return;
		
		User user = new User(session);
		userMap.put(session, user);
		if(currentHandler != null) {
			Task task = Task.createTask(session, TaskType.OPEN);
			currentHandler.addTask(task);
		}
	}
	
	@OnError
	public void onError(Throwable e){
		//e.printStackTrace();
	}
	
	@OnClose
	public void onClose(Session session){
		if(!running) return;
		
		if(currentHandler != null) {
			Task task = Task.createTask(session, TaskType.CLOSE);
			currentHandler.addTask(task);
		}
		userMap.remove(session);
		try {
			session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	@OnMessage
	public void onMessage(String message, Session session){
		if(!running) return;
		
		if(currentHandler != null) {
			String decodedMessage = Util.decode(message);
			//System.out.println("message: " + decodedMessage);
			Task task = Task.createTask(session, decodedMessage);
			currentHandler.addTask(task);
		}
	}
	
	public static void start(MessageCenter handler) {
		userMap = new HashMap<Session, User>();
		
		currentHandler = handler;
		currentHandler.start();
		running = true;
	}
	
	public static void stop() {
		running = false;
		if(currentHandler != null) {
			currentHandler.shutdown();
		}
	}
	
	public static boolean isRunning() {
		return running;
	}
	
	public static User getUser(Session session) {
		return userMap.get(session);
	}
}

