package cc.wheatup.server;

import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

import cc.wheatup.util.Util;

public abstract class TaskHandler extends Thread {
	protected boolean running = false;
	protected Queue<Task> tasks;
	protected static final int QUEUE_SIZE = 2048;
	protected static final int SLEEP_TIME = 1;
	
	public TaskHandler(){
		this.tasks = new ArrayBlockingQueue<Task>(QUEUE_SIZE);
	}
	
	@Override
	public void run() {
		this.running = true;
		while(running){
			while(!tasks.isEmpty()){
				try{
					handleTask(tasks.poll());
				}catch(Exception e){e.printStackTrace();}
			}
			try {
				Thread.sleep(SLEEP_TIME);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
	public void addTask(Task task){
		tasks.add(task);
	}
	
	public void shutdown(){
		running = false;
	}
	
	protected void handleTask(Task task){
		if(task == null) return;
		
		User user = task.user;
		if(user == null) return;
		
		try{
			switch(task.type){
				case OPEN:
					onUserConnected(user);
					break;
				case CLOSE:
					onUserDisconnected(user);
					break;
				case MESSAGE:
					String message = task.message;
					if(message == null || message.length() == 0) return;
					
					Map<String, Object> m = Util.parseJSON2Map(message);
					String type = String.valueOf(m.get("k"));
					String value = String.valueOf(m.get("v"));
					Map<String, Object> map = null;
					if(value != null && value.length() > 0){
						map = Util.parseJSON2Map(value);
					}
					handleMessage(user, type, map);
					break;
				default:
					break;
			}
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	public abstract void onUserConnected(User user);
	public abstract void onUserDisconnected(User user);
	public abstract void handleMessage(User user, String type, Map<String, Object> map);
}