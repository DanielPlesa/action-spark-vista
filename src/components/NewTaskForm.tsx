
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Task, Project } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewTaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  projects: Project[];
  editTask: Task | null;
  onUpdate: (id: string, data: Partial<Task>) => void;
}

const emptyTask: Omit<Task, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  completed: false,
  project: 'inbox',
  priority: 'medium',
  dueDate: null,
};

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  projects,
  editTask,
  onUpdate,
}) => {
  const [task, setTask] = useState<Omit<Task, 'id' | 'createdAt'>>({ ...emptyTask });
  const [date, setDate] = useState<Date | undefined>(undefined);

  React.useEffect(() => {
    if (editTask) {
      setTask({
        title: editTask.title,
        description: editTask.description,
        completed: editTask.completed,
        project: editTask.project,
        priority: editTask.priority,
        dueDate: editTask.dueDate,
      });
      
      if (editTask.dueDate) {
        setDate(new Date(editTask.dueDate));
      } else {
        setDate(undefined);
      }
    } else {
      setTask({ ...emptyTask });
      setDate(undefined);
    }
  }, [editTask, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (task.title.trim() === '') return;
    
    if (editTask) {
      onUpdate(editTask.id, task);
    } else {
      onSubmit(task);
    }
    
    onOpenChange(false);
    setTask({ ...emptyTask });
    setDate(undefined);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    setTask((prev) => ({ 
      ...prev, 
      dueDate: date ? date.toISOString() : null 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Task Title</Label>
            <Input
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              autoFocus
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder="Add some details (optional)"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="project" className="text-sm font-medium">Project</Label>
              <Select
                value={task.project}
                onValueChange={(value) => handleSelectChange('project', value)}
              >
                <SelectTrigger id="project" className="mt-1">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="due-date" className="text-sm font-medium">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-3 block">Priority</Label>
            <RadioGroup 
              value={task.priority} 
              onValueChange={(value) => handleSelectChange('priority', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-blue-500 font-medium">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-yellow-500 font-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-red-500 font-medium">High</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{editTask ? 'Update Task' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskForm;
