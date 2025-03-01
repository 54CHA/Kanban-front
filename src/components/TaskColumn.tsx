import React from 'react';
import { Task, Status } from '../types';
import TaskCard from './TaskCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface TaskColumnProps {
  title: string;
  status: Status;
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSubtasks: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onNavigateToSubtasks,
}) => {
  // Sort tasks by priority (high > medium > low)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-base font-medium text-gray-900">{title}</h2>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              snapshot.isDraggingOver ? 'bg-gray-50' : ''
            }`}
          >
            {sortedTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                  >
                    <TaskCard
                      task={task}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                      onNavigateToSubtasks={onNavigateToSubtasks}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No tasks yet</p>
                <p className="text-xs text-gray-400 mt-1">Add a new task to get started</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;