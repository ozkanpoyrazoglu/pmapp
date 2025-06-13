import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  confirmVariant = 'primary',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const confirmButtonClass = confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={!isLoading ? onClose : undefined}
        />

        {/* Dialog */}
        <div className="inline-block w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
              confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <ExclamationTriangleIcon 
                className={`h-6 w-6 ${
                  confirmVariant === 'danger' ? 'text-red-600' : 'text-blue-600'
                }`} 
              />
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`${confirmButtonClass} w-full sm:ml-3 sm:w-auto`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  İşleniyor...
                </div>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;