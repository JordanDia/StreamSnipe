import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export const TopNav = () => {
  return (
    <div className="h-16 px-4 bg-background-dark border-b border-zinc-800 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center">{/* Left side empty */}</div>
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-zinc-900 rounded-lg text-white text-sm font-medium hover:bg-zinc-800">
          Join anniversary contest
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-800">
          <BellIcon className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center px-3 py-1.5 bg-zinc-900 rounded-lg">
          {/* Lightning icon */}
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-amber-400 mr-1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" /></svg>
          <span className="text-white text-sm font-medium">71</span>
        </div>
        <button className="px-4 py-2 bg-zinc-800 rounded-lg text-white text-sm font-medium hover:bg-zinc-700">
          Add more credits
        </button>
      </div>
    </div>
  );
}; 