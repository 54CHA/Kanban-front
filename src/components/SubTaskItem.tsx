import React, { useState } from 'react';
import { SubTask, Status } from '../types';
import { Check, Trash, Edit } from 'lucide-react';

interface SubTaskItemProps {
  subTask: SubTask;
  onUpdate: (updatedSubTask: SubTask) => void;
  onDelete: (subTaskId: string) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({ subTask, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subTask.title);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...subTask,
      status: e.target.value as Status,
    });
  };

  const handleToggleComplete = () => {
    onUpdate({
      ...subTask,
      completed: !subTask.completed,
    });
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() === '') return;
    
    onUpdate({
      ...subTask,
      title: editedTitle,
    });
    
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-2 group hover:shadow-md transition-shadow">
      <div className="flex items-center mb-2">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-4 h-4 rounded border ${
            subTask.completed
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'border-gray-300 text-transparent hover:border-gray-400'
          } flex items-center justify-center mr-2 transition-colors`}
        >
          {subTask.completed && <Check size={10} />}
        </button>
        
        {isEditing ? (
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 bg-gray-50 text-gray-900 rounded px-2 py-1 border border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              className="ml-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <span
            className={`flex-1 text-sm ${
              subTask.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}
          >
            {subTask.title}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <select
          value={subTask.status}
          onChange={handleStatusChange}
          className="text-xs bg-gray-50 text-gray-700 rounded px-1.5 py-1 border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="backlog">Backlog</option>
          <option value="active">Active</option>
          <option value="finished">Finished</option>
        </select>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={() => onDelete(subTask.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
          >
            <Trash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubTaskItem;