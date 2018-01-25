package cc.wheatup.server;

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
	public static String version = "Test";
	private static Map<Session, User> userMap;
	private static boolean isOpen = false;
	
	@OnOpen
	public void onOpen(Session session)
	{
		User user = new User(session);
		userMap.put(session, user);
		if(currentHandler != null) {
			Task task = Task.createTask(session, TaskType.OPEN);
			currentHandler.addTask(task);
		}
	}
	
	@OnError
	public void onError(Throwable e)
	{
		e.printStackTrace();
	}
	
	@OnClose
	public void onClose(Session session)
	{
		if(currentHandler != null) {
			Task task = Task.createTask(session, TaskType.CLOSE);
			currentHandler.addTask(task);
		}
		userMap.remove(session);
	}
	
	@OnMessage
	public void onMessage(String message, Session session)
	{
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
		isOpen = true;
	}
	
	public static void stop() {
		isOpen = false;
	}
	
	public static boolean isOpen() {
		return isOpen;
	}
	
	public static User getUser(Session session) {
		return userMap.get(session);
	}
}

