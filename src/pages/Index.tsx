
import React, { useState, useEffect, useMemo } from 'react';
import { TaskProvider, useTaskContext } from '@/contexts/TaskContext';
import Header from '@/components/Header';
import ProjectList from '@/components/ProjectList';
import TaskList from '@/components/TaskList';
import NewTaskForm from '@/components/NewTaskForm';
import { Task } from '@/types';
import { format } from 'date-fns';
import { useAnimation } from '@/utils/animations';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const MainApp = () => {
  const { tasks, projects, addTask, updateTask, deleteTask, loading } = useTaskContext();
  const [selectedProject, setSelectedProject] = useState('inbox');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const appReady = useAnimation(100);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedProject === 'today') {
        // Show today's tasks from all projects
        if (!task.dueDate) return false;
        const today = format(new Date(), 'yyyy-MM-dd');
        const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
        return taskDate === today;
      }
      return task.project === selectedProject;
    }).sort((a, b) => {
      // Sort by completed status first, then by creation date
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, selectedProject]);

  const handleOpenNewTask = () => {
    setEditTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setIsFormOpen(true);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getProjectName = (projectId: string) => {
    if (projectId === 'today') return 'Today';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Tasks';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your tasks...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col transition-all duration-300 ${appReady ? 'opacity-100' : 'opacity-0'}`}>
      <Header 
        onNewTask={handleOpenNewTask} 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex flex-1 pt-16">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-64 border-r border-gray-100 h-[calc(100vh-64px)] fixed left-0 top-16 bg-white z-10"
            >
              <ProjectList
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <main 
          className={`flex-1 pt-6 px-6 pb-12 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <header className="mb-6">
            <h1 className="text-2xl font-bold">{getProjectName(selectedProject)}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {filteredTasks.filter(t => !t.completed).length} tasks remaining
            </p>
          </header>
          
          <TaskList
            tasks={filteredTasks}
            projects={projects}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
          />
        </main>
      </div>
      
      <NewTaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={addTask}
        projects={projects}
        editTask={editTask}
        onUpdate={updateTask}
      />
    </div>
  );
};

const Index = () => {
  return (
    <TaskProvider>
      <MainApp />
    </TaskProvider>
  );
};

export default Index;
