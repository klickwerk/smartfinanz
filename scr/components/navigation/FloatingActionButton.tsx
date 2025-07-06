import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white p-4 rounded-2xl shadow-2xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-95 hover:scale-110"
      style={{
        boxShadow: '0 0 30px rgba(0, 200, 200, 0.3), 0 0 60px rgba(0, 200, 200, 0.1)'
      }}
    >
      <Plus className="w-7 h-7" />
    </button>
  );
};