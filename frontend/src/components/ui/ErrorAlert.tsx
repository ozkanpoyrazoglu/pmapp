import React from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onDismiss, 
  className = '' 
}) => {
  return (
    <div className={`rounded-lg bg-red-50 border border-red-200 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-red-800">
            {message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                <span className="sr-only">Kapat</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;