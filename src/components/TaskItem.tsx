
import React, { useState, useRef } from 'react';
import { Task, Project } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MoreVertical, Trash2, Edit, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getPriorityColor } from '@/utils/animations';

interface TaskItemProps {
  task: Task;
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  style?: React.CSSProperties;
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  projects,
  onEdit,
  onDelete,
  onUpdate,
  style,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const getProjectById = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const toggleCompleted = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovering(false);
    }, 300) as unknown as number;
  };

  const project = getProjectById(task.project);
  const projectColor = project?.color || '#6366f1';

  return (
    <div
      className={`group p-4 rounded-lg mb-3 transition-all duration-300 hover-scale glass-panel ${
        task.completed ? 'opacity-70' : ''
      }`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleCompleted}
          className={`mt-1 transition-colors duration-300 ${task.completed ? 'bg-primary border-primary' : ''}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-medium truncate ${
                task.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mt-1 truncate">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: projectColor }}
            />
            <span className="text-xs text-gray-500">{project?.name}</span>

            {task.dueDate && (
              <div className="flex items-center">
                <span className="mx-1 text-gray-300">•</span>
                <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                <span className="text-xs text-gray-500">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <span className="mx-1 text-gray-300">•</span>
              <div className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                {priorityLabels[task.priority]}
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`transition-opacity duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleCompleted()}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as {task.completed ? 'incomplete' : 'complete'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
