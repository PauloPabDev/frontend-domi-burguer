import { addToast } from '@heroui/toast';

export const notify = {
  success: (title: string, description?: string) =>
    addToast({ title, description, color: 'success' }),

  error: (title: string, description?: string) =>
    addToast({ title, description, color: 'danger' }),

  info: (title: string, description?: string) =>
    addToast({ title, description, color: 'default' }),
};
