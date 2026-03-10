'use client';

import { ToastContainer, toast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultToastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: true,
};

export const notifySuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultToastOptions, ...options });
};

export const notifyError = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultToastOptions, ...options });
};

export const AppToastContainer = () => <ToastContainer />;
