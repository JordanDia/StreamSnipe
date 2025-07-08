import React from 'react';
import { InformationCircleIcon, ArrowUpTrayIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const features = [
    {
        icon: '✨',
        label: 'Long to shorts',
        bgColor: 'bg-zinc-800',
        isNew: false,
    },
    { icon: 'CC', label: 'AI Captions', bgColor: 'bg-green-600', isNew: false },
    { icon: '✂️', label: 'Video editor', bgColor: 'bg-zinc-800', isNew: true },
    {
        icon: '🎵',
        label: 'Enhance speech',
        bgColor: 'bg-blue-600',
        isNew: false,
    },
    { icon: '🔄', label: 'AI Reframe', bgColor: 'bg-blue-500', isNew: false },
    { icon: '🎬', label: 'AI B-Roll', bgColor: 'bg-blue-600', isNew: false },
    { icon: '🔥', label: 'AI hook', bgColor: 'bg-orange-500', isNew: false },
];

export const MainContent = () => {
    const navigate = useNavigate();
    
    const handleSearch = (username: string) => {
      navigate(`/channel/${username}`);
    };

    return (
        <div className="flex-1 flex flex-col items-center py-8 px-4 relative overflow-hidden">
            {/* Faded background text */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="text-[17rem] font-bold text-zinc-800 select-none absolute left-1/2 transform -translate-x-1/2">
                    StreamSnipe
                </div>
            </div>
            <div className="z-10 w-full max-w-4xl">
                {/* Search card */}
                <div className="bg-zinc-900 rounded-xl p-6 mt-20 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-black rounded-lg mb-4">
                        <LinkIcon className="w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Drop a Twitch link"
                            className="bg-transparent text-white flex-1 outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(e.currentTarget.value);
                                }
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <button className="flex items-center gap-2 text-zinc-300 text-sm">
                            <ArrowUpTrayIcon className="w-5 h-5 text-zinc-400" />
                            Upload
                        </button>
                        <button className="flex items-center gap-2 text-zinc-300 text-sm">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 14L12 6M12 6L9 9M12 6L15 9"
                                    stroke="#9CA3AF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M6 18H18"
                                    stroke="#9CA3AF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Google Drive
                        </button>
                    </div>
                    <button className="w-full py-3 bg-white text-black rounded-lg font-medium">
                        Get clips in 1 click
                    </button>
                </div>
                {/* Features grid */}
                <div className="grid grid-cols-7 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center justify-center rounded-lg p-4 ${feature.bgColor} relative`}
                        >
                            <span className="text-2xl mb-2">
                                {feature.icon}
                            </span>
                            <span className="text-sm text-white font-medium">
                                {feature.label}
                            </span>
                            {feature.isNew && (
                                <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs rounded px-2 py-0.5">
                                    New
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
