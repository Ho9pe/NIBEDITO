import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function useToast() {
  const showToast = {
    success: (message: string, options?: ToastOptions) => {
      return toast.success(message, {
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
      });
    },

    error: (message: string, options?: ToastOptions) => {
      return toast.error(message, {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
      });
    },

    loading: (message: string, options?: ToastOptions) => {
      return toast.loading(message, {
        position: options?.position || 'bottom-right',
      });
    },

    info: (message: string, options?: ToastOptions) => {
      return toast(message, {
        icon: 'ℹ️',
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      return toast(message, {
        icon: '⚠️',
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
      });
    },

    custom: (message: string, icon?: string, options?: ToastOptions) => {
      return toast(message, {
        icon: icon || '📢',
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
      });
    },

    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
      options?: ToastOptions
    ) => {
      return toast.promise(promise, messages, {
        position: options?.position || 'bottom-right',
      });
    },

    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },

    remove: (toastId: string) => {
      toast.remove(toastId);
    },
  };

  return showToast;
}

export default useToast;
