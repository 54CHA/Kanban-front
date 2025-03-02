import React, { useState } from 'react';
import { Task, Priority, Status } from '../types';
import { Trash, Edit, Clock, Calendar, X, ChevronDown, ChevronUp, Plus, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils';
import * as Dialog from '@radix-ui/react-dialog';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSubtasks: (task: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority = 'medium' }) => {
  const colors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };

  // Ensure priority is a valid value
  const validPriority = (priority && priority in colors) ? priority : 'medium';

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${colors[validPriority]}`}>
      {validPriority.charAt(0).toUpperCase() + validPriority.slice(1)}
    </span>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask, onNavigateToSubtasks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({
    ...task,
    subTasks: task.subTasks || [],
    priority: task.priority || 'medium',
    status: task.status || 'backlog',
    startDate: task.startDate || new Date().toISOString().split('T')[0],
    description: task.description || '',
  });

  const handleSaveEdit = () => {
    onUpdateTask(editedTask);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTask({ ...task, subTasks: task.subTasks || [] });
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    onDeleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  // Ensure subTasks is always an array
  const subTasks = task.subTasks || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <Dialog.Root open={isEditing} onOpenChange={setIsEditing}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] sm:w-full max-w-lg">
            <div className="bg-white rounded-lg shadow-lg w-full">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center justify-between px-4 py-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">Edit Task</Dialog.Title>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={editedTask.description}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 min-h-[80px]"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as Priority[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEditedTask({ ...editedTask, priority: value })}
                        className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                          editedTask.priority === value
                            ? value === 'low'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : value === 'medium'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Status })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 appearance-none bg-white"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="active">Active</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={editedTask.startDate || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-4 sm:flex sm:gap-4 sm:space-y-0">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={editedTask.dueDate || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || null })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      min={editedTask.startDate}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Time</label>
                    <input
                      type="time"
                      value={editedTask.dueTime || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, dueTime: e.target.value || null })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      disabled={!editedTask.dueDate}
                    />
                  </div>
                </div>
              </div>
              
              <div className="z-10 bg-white border-t border-gray-200 rounded-b-lg">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 p-4">
                  <button
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      <Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] sm:w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Delete Task
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete "{task.title}"? This action cannot be undone and will remove all subtasks.
                  </Dialog.Description>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="divide-y divide-gray-100">
        <div className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex-shrink-0 p-0.5 -ml-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-medium text-gray-900 truncate">{task.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    {subTasks.length > 0 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {subTasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center flex-wrap text-xs text-gray-500 gap-4 mt-2">
                {task.startDate && (
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1 flex-shrink-0" />
                    <span>{formatDate(task.startDate)}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1 flex-shrink-0" />
                    <span>
                      Due: {formatDate(task.dueDate)}
                      {task.dueTime && ` at ${task.dueTime}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-1 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Edit Task"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onNavigateToSubtasks(task)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Add Subtask"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                title="Delete Task"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            {task.description && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
            )}
            
            {subTasks.length > 0 && (
              <div className="px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Subtasks</h4>
                  <button
                    onClick={() => onNavigateToSubtasks(task)}
                    className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 group"
                  >
                    View All
                    <ChevronDown size={12} className="-rotate-90 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                <div className="space-y-2">
                  {subTasks.slice(0, 3).map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between rounded-md bg-white p-2 border border-gray-200"
                    >
                      <span className="text-sm text-gray-900">{subtask.title}</span>
                      <PriorityBadge priority={subtask.priority} />
                    </div>
                  ))}
                  {subTasks.length > 3 && (
                    <button
                      onClick={() => onNavigateToSubtasks(task)}
                      className="w-full text-center py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      +{subTasks.length - 3} more subtasks
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;