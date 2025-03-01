import React, { useState } from 'react';
import { Task, Priority, Status } from '../types';
import { X, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('backlog');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      status: status || 'backlog',
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      subTasks: [],
    };
    
    onAddTask(newTask);
  };

  const getPriorityColor = (value: Priority) => {
    const colors = {
      low: 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
      medium: 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      high: 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100',
    };
    return colors[value];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900">Create New Task</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mt-1">
              Add a new task to your workflow
            </Dialog.Description>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <form id="taskForm" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">Required field</span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Enter a clear title for your task"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                    priority === value
                      ? `${getPriorityColor(value)} border-current shadow-sm`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
              Initial Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 appearance-none bg-white"
            >
              <option value="backlog">Backlog</option>
              <option value="active">Active</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Calendar size={14} className="text-gray-400" />
            </div>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showMoreOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showMoreOptions ? 'Show less options' : 'Show more options'}
          </button>

          {showMoreOptions && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 min-h-[80px]"
                  placeholder="Add any additional details about the task"
                  rows={3}
                />
              </div>

              <div className="space-y-4 sm:flex sm:gap-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <Calendar size={14} className="text-gray-400" />
                  </div>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    min={startDate}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700">
                      Due Time
                    </label>
                    <Clock size={14} className="text-gray-400" />
                  </div>
                  <input
                    id="dueTime"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    disabled={!dueDate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {dueDate && new Date(dueDate) < new Date(startDate) && (
          <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle size={16} className="text-yellow-700 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              The due date should be after the start date.
            </p>
          </div>
        )}
      </form>

      <div className="z-10 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-end gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="taskForm"
            className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;