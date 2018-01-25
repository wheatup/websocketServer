package cc.wheatup.server;

import javax.websocket.Session;

public class Task {
	public User user;
	public String message;
	public TaskType type;
	private Task(User user, String message){
		this.user = user;
		this.message = message;
		this.type = TaskType.MESSAGE;
	}
	
	private Task(User user, TaskType type){
		this.user = user;
		this.type = type;
	}
	
	public static Task createTask(Session session, String message){
		Task task = null;
		
		User user = Server.getUser(session);
		
		if(user != null){
			task = new Task(user, message);
		}

		return task;
	}
	
	public static Task createTask(Session session, TaskType type){
		Task task = null;
		
		User user = Server.getUser(session);
		
		if(user != null){
			task = new Task(user, type);
		}

		return task;
	}
}

enum TaskType{
	OPEN,
	CLOSE,
	MESSAGE
}