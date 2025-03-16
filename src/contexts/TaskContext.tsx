
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Task, Project, Priority } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface TaskContextProps {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loading: boolean;
}

const defaultProjects: Project[] = [
  { id: 'inbox', name: 'Inbox', color: '#4f46e5' },
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'work', name: 'Work', color: '#f97316' },
];

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Initial fetch of tasks and projects
  useEffect(() => {
    const fetchTasksAndProjects = async () => {
      if (!user) {
        setTasks([]);
        setProjects(defaultProjects);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;

        // Fetch custom projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');

        if (projectsError) throw projectsError;

        // Transform to our app's format
        const formattedTasks = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          completed: task.completed,
          project: task.project,
          priority: task.priority as Priority,
          dueDate: task.due_date,
          createdAt: task.created_at,
        }));

        const formattedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          color: project.color,
        }));

        // Combine default projects with custom projects
        setTasks(formattedTasks);
        setProjects([...defaultProjects, ...formattedProjects]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your tasks and projects');
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndProjects();
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          project: task.project,
          priority: task.priority,
          due_date: task.dueDate,
        }])
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        completed: data.completed,
        project: data.project,
        priority: data.priority as Priority,
        dueDate: data.due_date,
        createdAt: data.created_at,
      };

      setTasks(prevTasks => [newTask, ...prevTasks]);
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    if (!user) return;

    try {
      // Convert from our app format to database format
      const dbUpdateData: any = {};
      if ('title' in updatedTask) dbUpdateData.title = updatedTask.title;
      if ('description' in updatedTask) dbUpdateData.description = updatedTask.description;
      if ('completed' in updatedTask) dbUpdateData.completed = updatedTask.completed;
      if ('project' in updatedTask) dbUpdateData.project = updatedTask.project;
      if ('priority' in updatedTask) dbUpdateData.priority = updatedTask.priority;
      if ('dueDate' in updatedTask) dbUpdateData.due_date = updatedTask.dueDate;

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdateData)
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      );
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    if (!user) return;

    // Don't add custom projects with the same ID as default projects
    if (['inbox', 'personal', 'work'].includes(project.name.toLowerCase())) {
      toast.error("Cannot create a project with a reserved name");
      return;
    }

    try {
      // Custom projects go to the database
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          name: project.name,
          color: project.color,
        }])
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        color: data.color,
      };

      setProjects(prevProjects => [...prevProjects, newProject]);
      toast.success('Project added successfully');
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to add project');
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    // Don't allow deleting default projects
    if (['inbox', 'personal', 'work'].includes(id)) {
      toast.error("Can't delete default projects");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      
      // Move tasks from this project to Inbox
      const tasksToUpdate = tasks.filter(task => task.project === id);
      for (const task of tasksToUpdate) {
        await updateTask(task.id, { project: 'inbox' });
      }
      
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
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
        loading
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
