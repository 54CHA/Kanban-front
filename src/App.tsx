import React, { useState, useEffect } from 'react';
import { Task, Status } from './types';
import TaskColumn from './components/TaskColumn';
import TaskForm from './components/TaskForm';
import { Plus, CheckSquare, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { api } from './services/api';

interface TaskPath {
  id: string;
  title: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [currentTaskPath, setCurrentTaskPath] = useState<TaskPath[]>([]);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
      setCurrentTasks(fetchedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to load tasks: ${errorMessage}`);
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      setError(null);
      if (currentTaskPath.length === 0) {
        const createdTask = await api.createTask(newTask);
        const updatedTasks = [...tasks, createdTask];
        setTasks(updatedTasks);
        setCurrentTasks(updatedTasks);
      } else {
        const lastTask = currentTaskPath[currentTaskPath.length - 1];
        const createdSubtask = await api.createSubtask(lastTask.id, newTask);
        const updatedTasks = updateTasksRecursively(tasks, lastTask.id, (task) => ({
          ...task,
          subTasks: [...(task.subTasks || []), createdSubtask],
        }));
        setTasks(updatedTasks);
        setCurrentTasks(getTasksByPath(updatedTasks, currentTaskPath));
      }
      setShowAddTaskForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to create task: ${errorMessage}`);
      console.error('Error creating task:', err);
    }
  };

  const updateTasksRecursively = (taskList: Task[], taskId: string, updateFn: (task: Task) => Task): Task[] => {
    return taskList.map(task => {
      if (task.id === taskId) {
        return updateFn(task);
      }
      if (task.subTasks && task.subTasks.length > 0) {
        return {
          ...task,
          subTasks: updateTasksRecursively(task.subTasks, taskId, updateFn),
        };
      }
      return task;
    });
  };

  const getTasksByPath = (taskList: Task[], path: TaskPath[]): Task[] => {
    if (path.length === 0) return taskList;
    
    let current = taskList;
    for (const p of path) {
      const task = current.find(t => t.id === p.id);
      if (!task || !task.subTasks) return [];
      current = task.subTasks;
    }
    return current;
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      setError(null);
      await api.updateTask(updatedTask);
      if (currentTaskPath.length === 0) {
        const updatedTasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
        setTasks(updatedTasks);
        setCurrentTasks(updatedTasks);
      } else {
        const lastTask = currentTaskPath[currentTaskPath.length - 1];
        const updatedTasks = updateTasksRecursively(tasks, lastTask.id, (task) => ({
          ...task,
          subTasks: (task.subTasks || []).map(st => st.id === updatedTask.id ? updatedTask : st),
        }));
        setTasks(updatedTasks);
        setCurrentTasks(getTasksByPath(updatedTasks, currentTaskPath));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to update task: ${errorMessage}`);
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null);
      await api.deleteTask(taskId);
      if (currentTaskPath.length === 0) {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        setCurrentTasks(updatedTasks);
      } else {
        const lastTask = currentTaskPath[currentTaskPath.length - 1];
        const updatedTasks = updateTasksRecursively(tasks, lastTask.id, (task) => ({
          ...task,
          subTasks: (task.subTasks || []).filter(st => st.id !== taskId),
        }));
        setTasks(updatedTasks);
        setCurrentTasks(getTasksByPath(updatedTasks, currentTaskPath));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to delete task: ${errorMessage}`);
      console.error('Error deleting task:', err);
    }
  };

  const handleNavigateToSubtasks = async (task: Task) => {
    try {
      setError(null);
      const subtasks = await api.getSubtasks(task.id);
      const newPath = [...currentTaskPath, { id: task.id, title: task.title }];
      setCurrentTaskPath(newPath);
      setCurrentTasks(subtasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to load subtasks: ${errorMessage}`);
      console.error('Error loading subtasks:', err);
    }
  };

  const handleNavigateToBreadcrumb = async (index: number) => {
    try {
      if (index === -1) {
        const rootTasks = await api.getTasks();
        setCurrentTaskPath([]);
        setCurrentTasks(rootTasks);
      } else {
        const newPath = currentTaskPath.slice(0, index + 1);
        const lastTask = newPath[newPath.length - 1];
        const subtasks = await api.getSubtasks(lastTask.id);
        setCurrentTaskPath(newPath);
        setCurrentTasks(subtasks);
      }
    } catch (err) {
      setError('Failed to navigate. Please try again.');
      console.error('Error navigating:', err);
    }
  };

  const getTasksByStatus = (status: Status) => {
    return (currentTasks || []).filter(task => task.status === status);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = currentTasks.find(t => t.id === draggableId);
    if (!task) return;

    try {
      // Create a copy of the current tasks
      const newTasks = [...currentTasks];
      
      // Find and remove the task from its current position
      const taskIndex = newTasks.findIndex(t => t.id === draggableId);
      const [removedTask] = newTasks.splice(taskIndex, 1);
      
      // Create updated task with new status
      const updatedTask = {
        ...removedTask,
        status: destination.droppableId as Status,
      };

      // Insert the task at its new position
      const tasksInDestination = newTasks.filter(t => t.status === destination.droppableId);
      const insertIndex = newTasks.findIndex(t => t.status === destination.droppableId) + destination.index;
      newTasks.splice(insertIndex, 0, updatedTask);

      // Update the UI immediately
      if (currentTaskPath.length === 0) {
        setTasks(newTasks);
      }
      setCurrentTasks(newTasks);

      // Make the API call
      await api.updateTask(updatedTask);
    } catch (err) {
      // If the API call fails, revert to the original state
      if (currentTaskPath.length === 0) {
        setTasks([...tasks]);
      }
      setCurrentTasks([...currentTasks]);
      
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to update task status: ${errorMessage}`);
      console.error('Error updating task status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm overflow-x-auto">
            <button
              onClick={() => handleNavigateToBreadcrumb(-1)}
              className="text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              All Tasks
            </button>
            {currentTaskPath.map((path, index) => (
              <React.Fragment key={path.id}>
                <ChevronRight size={16} className="text-gray-400 mx-2 flex-shrink-0" />
                <button
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  className={`whitespace-nowrap ${
                    index === currentTaskPath.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {path.title}
                </button>
              </React.Fragment>
            ))}
          </div>
          
          <Dialog.Root open={showAddTaskForm} onOpenChange={setShowAddTaskForm}>
            <Dialog.Trigger asChild>
              <button
                className="sm:inline-flex sm:items-center h-9 sm:px-4 p-2 rounded-full sm:rounded-md bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              >
                <Plus size={16} className="sm:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">New Task</span>
              </button>
            </Dialog.Trigger>
            
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] sm:w-full max-w-2xl">
                <TaskForm
                  onAddTask={handleAddTask}
                  onClose={() => setShowAddTaskForm(false)}
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <TaskColumn
                title="Backlog"
                status="backlog"
                tasks={getTasksByStatus('backlog')}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onNavigateToSubtasks={handleNavigateToSubtasks}
              />
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <TaskColumn
                title="Active"
                status="active"
                tasks={getTasksByStatus('active')}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onNavigateToSubtasks={handleNavigateToSubtasks}
              />
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <TaskColumn
                title="Finished"
                status="finished"
                tasks={getTasksByStatus('finished')}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onNavigateToSubtasks={handleNavigateToSubtasks}
              />
            </div>
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}

export default App;