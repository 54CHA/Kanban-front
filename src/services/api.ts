import { Task } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

let requestCounter = 0;

const fetchWithConfig = async (url: string, options: RequestInit = {}) => {
  const requestId = ++requestCounter;
  console.log(`[Request #${requestId}] Starting request to ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Request #${requestId}] HTTP error! status: ${response.status}, message: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }

    console.log(`[Request #${requestId}] Request successful`);
    return response;
  } catch (error) {
    console.error(`[Request #${requestId}] Network or parsing error:`, error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`[Request #${requestId}] Failed to connect to server. Please check if the backend is running at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export const api = {
  async getTasks(): Promise<Task[]> {
    try {
      console.log('Fetching all tasks...');
      const response = await fetchWithConfig(`${API_BASE_URL}/tasks`);
      const data = await response.json();
      console.log('Successfully fetched tasks:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      console.log('Creating new task:', task);
      const response = await fetchWithConfig(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task),
      });
      
      const data = await response.json();
      console.log('Successfully created task:', data);
      
      const createdTask = data.task || data;
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(task: Task): Promise<Task> {
    try {
      console.log('Updating task:', task);
      const response = await fetchWithConfig(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
      const data = await response.json();
      console.log('Successfully updated task:', data);
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('Deleting task:', taskId);
      await fetchWithConfig(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      console.log('Successfully deleted task:', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async getSubtasks(taskId: string): Promise<Task[]> {
    try {
      console.log('Fetching subtasks for task:', taskId);
      const response = await fetchWithConfig(`${API_BASE_URL}/tasks/${taskId}/subtasks`);
      const data = await response.json();
      console.log('Successfully fetched subtasks:', data);
      return data;
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      throw error;
    }
  },

  async createSubtask(parentId: string, subtask: Omit<Task, 'id'>): Promise<Task> {
    try {
      console.log('Creating subtask for parent:', parentId, subtask);
      const response = await fetchWithConfig(`${API_BASE_URL}/tasks/${parentId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify(subtask),
      });
      const data = await response.json();
      console.log('Successfully created subtask:', data);
      return data;
    } catch (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }
  },
}; 