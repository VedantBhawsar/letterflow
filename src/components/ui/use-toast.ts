"use client";
import { useState, useCallback } from "react";

type ToastAction = {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
};

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: ToastAction;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, action, variant }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, title, description, action, variant }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, toast, dismiss };
};
