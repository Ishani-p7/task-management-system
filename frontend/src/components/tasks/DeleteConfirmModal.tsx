'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Task } from '@/types';

interface Props {
  task: Task | null;
  onClose: () => void;
  onConfirm: (task: Task) => Promise<void>;
}

export default function DeleteConfirmModal({ task, onClose, onConfirm }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!task) return null;

  async function handleConfirm() {
    if (!task) return;
    setIsDeleting(true);
    try {
      await onConfirm(task);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn-ghost p-1.5 text-gray-400 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Delete task</h2>
        </div>

        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to delete:
        </p>
        <p className="text-sm font-medium text-gray-900 mb-5 truncate">
          &ldquo;{task.title}&rdquo;
        </p>
        <p className="text-xs text-gray-500 mb-6">
          This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="btn-danger flex-1"
          >
            {isDeleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
