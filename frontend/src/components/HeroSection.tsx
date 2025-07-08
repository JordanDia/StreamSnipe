import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: any) => {
        e.preventDefault();
        if (username.trim()) {
            navigate(`/channel/${username.trim()}`);
        }
    };

    const goToLinkPage = () => {
        navigate('/link');
    };

    return (
        <div className="w-full flex flex-col items-center justify-center text-center px-4 py-20 text-white">
            <h2 className="text-md md:text-lg font-semibold text-purple-400 mb-2">
                #1 Twitch Video Clipping Tool
            </h2>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                Get Viral Stream Moments Instantly
            </h1>
            <p className="text-sm md:text-base max-w-xl text-gray-200 mb-8">
                StreamSnipe gathers the top viral moments for you to save time.
            </p>

            {/* Twitch username search */}
            <form onSubmit={handleSearch} className="relative w-full max-w-xl">
                <input
                    type="text"
                    placeholder="Search Twitch channel..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full py-3 pl-4 pr-32 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                    type="submit"
                    className="absolute top-1 right-1 h-[calc(100%-0.5rem)] px-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full"
                >
                    Search
                </button>
            </form>


            {/* Link entry button */}
            <button
                onClick={goToLinkPage}
                className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-md font-medium text-white"
            >
                Paste Twitch VOD Link Instead
            </button>
        </div>
    );
};

export default HeroSection;
