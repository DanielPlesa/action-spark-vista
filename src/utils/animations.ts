
import { useEffect, useState } from 'react';

export const useAnimation = (delay = 0) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return show;
};

export const getRandomDelay = (min = 0, max = 300) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'high': 
      return 'text-red-500 bg-red-50';
    case 'medium': 
      return 'text-yellow-500 bg-yellow-50';
    case 'low':
    default:
      return 'text-blue-500 bg-blue-50';
  }
};
