export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const saveTasksToLocalStorage = (tasks: any[]): void => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

export const getTasksFromLocalStorage = (): any[] => {
  const tasksJson = localStorage.getItem('tasks');
  return tasksJson ? JSON.parse(tasksJson) : [];
};