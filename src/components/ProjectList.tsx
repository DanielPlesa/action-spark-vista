
import React, { useState, useRef } from 'react';
import { Project } from '@/types';
import { useTaskContext } from '@/contexts/TaskContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Inbox, Plus, Briefcase, User, X, CalendarDays, PlusCircle } from 'lucide-react';
import { useAnimation } from '@/utils/animations';

interface ProjectListProps {
  selectedProject: string;
  onSelectProject: (projectId: string) => void;
  className?: string;
}

const ProjectIcon: React.FC<{ id: string; color: string }> = ({ id, color }) => {
  switch (id) {
    case 'inbox':
      return <Inbox size={18} className="text-indigo-500" />;
    case 'personal':
      return <User size={18} className="text-emerald-500" />;
    case 'work':
      return <Briefcase size={18} className="text-orange-500" />;
    default:
      return (
        <div 
          className="w-[18px] h-[18px] rounded-full" 
          style={{ backgroundColor: color }} 
        />
      );
  }
};

const ProjectList: React.FC<ProjectListProps> = ({ 
  selectedProject, 
  onSelectProject, 
  className = '' 
}) => {
  const { projects, addProject, deleteProject, tasks } = useTaskContext();
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#6366f1');
  const inputRef = useRef<HTMLInputElement>(null);
  const animated = useAnimation(200);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject({
        name: newProjectName.trim(),
        color: newProjectColor,
      });
      setNewProjectName('');
      setIsAddingProject(false);
    }
  };

  const startAddingProject = () => {
    setIsAddingProject(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const getTaskCount = (projectId: string) => {
    return tasks.filter(task => task.project === projectId && !task.completed).length;
  };

  const predefinedColors = [
    '#6366f1', '#8b5cf6', '#ec4899',
    '#f97316', '#10b981', '#06b6d4',
    '#3b82f6', '#ef4444', '#a855f7'
  ];

  return (
    <div className={`p-2 ${className} transition-opacity duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center justify-between mb-2 px-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Projects</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1 pr-2">
          {projects.map((project, index) => (
            <Button
              key={project.id}
              variant="ghost"
              onClick={() => onSelectProject(project.id)}
              className={`w-full justify-start mb-1 transition-all duration-300 hover:translate-x-1 ${
                selectedProject === project.id
                  ? 'bg-primary/10 font-medium'
                  : 'opacity-90'
              }`}
              style={{
                transitionDelay: `${index * 50}ms`,
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateX(0)' : 'translateX(-20px)'
              }}
            >
              <ProjectIcon id={project.id} color={project.color} />
              <span className="ml-2 flex-1 truncate">{project.name}</span>
              <span className="bg-background rounded-full px-2 text-xs">
                {getTaskCount(project.id)}
              </span>
            </Button>
          ))}
        </div>

        {isAddingProject ? (
          <div className="mt-4 glass-panel rounded-lg p-3 space-y-3 animate-scale-in">
            <Input
              ref={inputRef}
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newProjectColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewProjectColor(color)}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingProject(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddProject}>
                Add Project
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full justify-start text-muted-foreground hover:text-primary hover-scale"
            onClick={startAddingProject}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        )}
        
        <div className="mt-8 mx-1">
          <Button
            variant="ghost"
            className="w-full justify-start mb-1"
            onClick={() => onSelectProject('today')}
          >
            <CalendarDays size={18} className="text-blue-500" />
            <span className="ml-2">Today</span>
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProjectList;
