
import React, { useState, useEffect } from 'react';
import { Task, Project } from '@/types';
import TaskItem from './TaskItem';
import { useAnimation } from '@/utils/animations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCheck } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const animated = useAnimation(300);

  useEffect(() => {
    // Animate tasks appearing one by one
    const timer = setTimeout(() => {
      setVisibleTasks(tasks);
    }, 300);

    return () => clearTimeout(timer);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div 
        className={`flex flex-col items-center justify-center h-64 text-center text-gray-500 transition-opacity duration-500 ${
          animated ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ClipboardCheck size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium mb-2">No tasks yet</h3>
        <p className="text-sm">Create your first task to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 pr-3 overflow-y-auto">
      <div className={`transition-opacity duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}>
        {visibleTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            projects={projects}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            style={{
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.3s ease-out ${index * 0.05}s`,
            }}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default TaskList;
