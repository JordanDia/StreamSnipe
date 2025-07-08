import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';

function LinkClipper() {
    const [twitchURL, setTwitchURL] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [statusActive, setStatusActive] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setStatusActive(true);

        try {
            const response = await fetch("http://localhost:8000/clips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    twitch_url: twitchURL || "https://www.twitch.tv/videos/2482589381",
                    start_time: startTime || "01:32:00",
                    end_time: endTime || "02:46:00",
                    vod_username: (() => {
                        const match = (twitchURL || "").match(/twitch\.tv\/(\w+)/);
                        return match ? match[1] : '';
                    })(),
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server responded with error:", errorText);
                return;
            }

            const data = await response.json();
            console.log("Got response:", data);
            navigate("/clips", { state: { clips: data.clips } });
        } catch (err) {
            console.error("Failed to submit:", err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-8">
                <h1 className="text-3xl font-bold text-center mb-8">Twitch VOD Clipper</h1>
                
                <div className="space-y-4">
                    <input
                        type="text"
                        value={twitchURL}
                        onChange={(e) => setTwitchURL(e.target.value)}
                        placeholder="Enter Twitch VOD link"
                        className="bg-gray-800 w-full px-4 py-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-gray-400"
                    />
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="Start Time (00:00:00)"
                        className="bg-gray-800 flex-1 px-4 py-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-gray-400"
                    />

                    <input
                        type="text"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="End Time (00:00:00)"
                        className="bg-gray-800 flex-1 px-4 py-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-gray-400"
                    />
                </div>

                <button 
                    className="w-full mt-8 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 font-semibold" 
                    onClick={handleSubmit}
                >
                    Get Hype Moments
                </button>

                <StatusMessage active={statusActive} />
            </div>
        </div>
    );
}

export default LinkClipper;