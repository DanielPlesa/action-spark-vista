
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Task, Project } from '@/types';
import { toast } from 'sonner';

interface TaskContextProps {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
}

const defaultProjects: Project[] = [
  { id: 'inbox', name: 'Inbox', color: '#4f46e5' },
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'work', name: 'Work', color: '#f97316' },
];

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : defaultProjects;
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    toast.success('Task added successfully');
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      )
    );
    toast.success('Task updated successfully');
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    toast.success('Task deleted successfully');
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
    };
    setProjects((prevProjects) => [...prevProjects, newProject]);
    toast.success('Project added successfully');
  };

  const deleteProject = (id: string) => {
    // Don't allow deleting default projects
    if (['inbox', 'personal', 'work'].includes(id)) {
      toast.error("Can't delete default projects");
      return;
    }
    
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    // Move tasks from this project to Inbox
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.project === id ? { ...task, project: 'inbox' } : task
      )
    );
    toast.success('Project deleted successfully');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        addTask,
        updateTask,
        deleteTask,
        addProject,
        deleteProject,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
