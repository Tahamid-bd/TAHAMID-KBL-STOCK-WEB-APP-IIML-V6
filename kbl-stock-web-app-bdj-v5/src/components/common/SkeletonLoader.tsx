import React from 'react';

interface GlobalSkeletonLoaderProps {
  type?: string;
  message?: string;
}

export const GlobalSkeletonLoader: React.FC<GlobalSkeletonLoaderProps> = ({ type, message }) => {
  return (
    <div className="w-full space-y-4 animate-pulse p-4">
      {message && (
        <div className="text-xs font-semibold text-slate-500 mb-2">{message}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  );
};
