import { useState } from 'react';

interface TwitchChannelSearchBarProps {
    onSearch: (channel: string) => void;
}

const TwitchChannelSearchBar = ({ onSearch }: TwitchChannelSearchBarProps) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSearch(input.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl mx-auto bg-[#23272e] rounded-2xl shadow border border-[#2c2f36] p-0 flex flex-col items-stretch"
        >
            <div className="flex items-center w-full">
                <span className="pl-4 pr-2 text-gray-400">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search Twitch channels..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 py-4 pr-4 focus:outline-none text-base"
                />
                <button
                    type="submit"
                    className="bg-[#23272e] hover:bg-[#181a20] text-gray-200 font-semibold rounded-xl px-5 py-2 mr-2 transition-colors border border-[#2c2f36]"
                >
                    Search
                </button>
            </div>
        </form>
    );
};

export default TwitchChannelSearchBar;
