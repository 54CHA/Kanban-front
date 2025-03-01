import React, { useState, useEffect } from 'react';
import { Task, Status } from './types';
import TaskColumn from './components/TaskColumn';
import TaskForm from './components/TaskForm';
import { saveTasksToLocalStorage, getTasksFromLocalStorage } from './utils';
import { Plus, CheckSquare, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface TaskPath {
  id: string;
  title: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [currentTaskPath, setCurrentTaskPath] = useState<TaskPath[]>([]);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = getTasksFromLocalStorage();
    if (savedTasks.length > 0) {
      setTasks(savedTasks);
      setCurrentTasks(savedTasks);
    }
  }, []);

  useEffect(() => {
    saveTasksToLocalStorage(tasks);
  }, [tasks]);

  const handleAddTask = (newTask: Task) => {
    if (currentTaskPath.length === 0) {
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setCurrentTasks(updatedTasks);
    } else {
      const lastTask = currentTaskPath[currentTaskPath.length - 1];
      const updatedTasks = updateTasksRecursively(tasks, lastTask.id, (task) => ({
        ...task,
        subTasks: [...(task.subTasks || []), { ...newTask, id: `${task.id}-${Date.now()}` }],
      }));
      setTasks(updatedTasks);
      setCurrentTasks(getTasksByPath(updatedTasks, currentTaskPath));
    }
    setShowAddTaskForm(false);
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

  const handleUpdateTask = (updatedTask: Task) => {
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
  };

  const handleDeleteTask = (taskId: string) => {
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
  };

  const handleNavigateToSubtasks = (task: Task) => {
    const newPath = [...currentTaskPath, { id: task.id, title: task.title }];
    setCurrentTaskPath(newPath);
    setCurrentTasks(task.subTasks || []);
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentTaskPath([]);
      setCurrentTasks(tasks);
    } else {
      const newPath = currentTaskPath.slice(0, index + 1);
      setCurrentTaskPath(newPath);
      setCurrentTasks(getTasksByPath(tasks, newPath));
    }
  };

  const getTasksByStatus = (status: Status) => {
    return (currentTasks || []).filter(task => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4">
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
      </main>
    </div>
  );
}

export default App;