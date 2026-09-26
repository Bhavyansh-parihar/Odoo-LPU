import { useToastStore } from '../store/toastStore';

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  return {
    toast: addToast,
    success: (title, description) => addToast({ title, description, type: 'success' }),
    error: (title, description) => addToast({ title, description, type: 'error' }),
    warning: (title, description) => addToast({ title, description, type: 'warning' }),
    info: (title, description) => addToast({ title, description, type: 'info' })
  };
};
