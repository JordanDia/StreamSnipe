import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

function secondsToHHMMSS(seconds: number) {
    const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function hhmmssToSeconds(hhmmss: string) {
    const [h, m, s] = hhmmss.split(':').map(Number);
    return h * 3600 + m * 60 + s;
}

// NEW: Parse Twitch duration format (e.g., '4h34m47s') to seconds
function twitchDurationToSeconds(duration: string): number {
    const match = duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!match) return 0;
    const [, h, m, s] = match;
    return (
        parseInt(h || '0', 10) * 3600 +
        parseInt(m || '0', 10) * 60 +
        parseInt(s || '0', 10)
    );
}

const VodWorkflow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const vodData = location.state?.vodData;
    if (
        !vodData ||
        !vodData.url ||
        !vodData.thumbnail_url ||
        !vodData.duration ||
        !vodData.title
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
                Unable to fetch VOD data. Please go back and select a VOD again.
            </div>
        );
    }

    const vodUrl = vodData.url;
    const vodThumbnail = vodData.thumbnail_url;
    const vodDurationStr = vodData.duration;
    const vodTitle = vodData.title;
    // Use the new parser for Twitch duration
    const vodDuration = twitchDurationToSeconds(vodDurationStr);
    const [inputValue, setInputValue] = useState(vodUrl);
    const [activeTab, setActiveTab] = useState('ai');
    const [range, setRange] = useState([0, vodDuration]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRemove = () => {
        setInputValue('');
        navigate('/dashboard');
    };

    const handleSliderChange = (value: number[]) => {
        setRange(value);
    };

    const handleGetClips = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8000/clips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    twitch_url: vodUrl,
                    start_time: secondsToHHMMSS(range[0]),
                    end_time: secondsToHHMMSS(range[1]),
                    user_id: user.id,
                    vod_title: vodTitle,
                    vod_thumbnail: vodThumbnail,
                    vod_username:
                        vodData.display_name ||
                        vodData.user_login ||
                        vodData.user_name ||
                        '',
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch clips');
            }
            const data = await response.json();
            // Optimistically add the new project to the cache
            queryClient.setQueryData(['projects', user.id], (oldRaw) => {
                const old = Array.isArray(oldRaw) ? oldRaw : [];
                return [
                    {
                        project_id: data.project_id,
                        id: data.project_id,
                        user_id: user.id,
                        vod_url: vodUrl,
                        vod_title: vodTitle,
                        vod_thumbnail: vodThumbnail,
                        vod_username:
                            vodData.display_name ||
                            vodData.user_login ||
                            vodData.user_name ||
                            '',
                        status: 'In queue',
                        created_at: new Date().toISOString(),
                        clips: [],
                    },
                    ...old,
                ];
            });
            navigate('/dashboard', { state: { newProjectId: data.project_id } });
        } catch (err) {
            setError('Error fetching clips. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col items-center py-12 px-4 mt-20">
            {/* Top Section */}
            <div className="w-full max-w-md flex flex-col items-center mx-auto">
                {/* Search bar */}
                <div className="flex items-center w-full bg-background-dark rounded-lg border-[0.5px] border-zinc-800px-4 py-3 px-3 mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4 mr-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                        />
                    </svg>
                    <input
                        type="text"
                        value={inputValue}
                        readOnly
                        className="flex-1 text-text-transparent outline-none text-md sm:text-sm"
                    />
                    {inputValue && (
                        <button
                            className="text-zinc-400 hover:text-white text-sm px-2 py-1"
                            onClick={handleRemove}
                        >
                            Remove
                        </button>
                    )}
                </div>
                {/* Get Clips Button */}
                <button
                    className="w-full py-2 bg-white text-black rounded-md font-semibold text-md mb-4 disabled:opacity-60"
                    onClick={handleGetClips}
                    disabled={loading}
                >
                    {loading ? 'Getting clips...' : 'Get clips in 1 click'}
                </button>
                {/* Speech language and credit usage row */}
                <div className="flex items-center justify-center w-full gap-8 mb-4">
                    <div className="flex items-center gap-1">
                        <span className="text-zinc-300 text-sm">
                            Speech language:
                        </span>
                        <button className="text-white font-medium text-sm flex items-center gap-1 bg-transparent p-0">
                            Auto
                            <svg
                                width="16"
                                height="16"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                color="currentColor"
                            >
                                <path
                                    d="M6 9L12 15L18 9"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-zinc-300 text-sm">
                            Credit usage:
                        </span>
                        <span className="text-amber-400 font-bold text-sm">
                            ⚡ 274
                        </span>
                    </div>
                </div>
                {/* Thumbnail Preview */}
                <div className="flex justify-center w-full mb-2">
                    <img
                        src={vodThumbnail}
                        alt="VOD Thumbnail"
                        className="rounded-lg w-80 h-44 object-cover border border-zinc-800"
                    />
                </div>
            </div>
            {/* Bottom Section */}
            <div className="w-full px-4 flex flex-col items-center mt-8">
                <div className="w-full max-w-2xl bg-ring-background rounded-lg shadow-lg p-6">
                    <div className="text-sm py-2 text-muted-foreground">
                        Include specific moments
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            className="w-full bg-ring-background rounded-md border px-4 py-2 text-white placeholder-zinc-400 text-sm outline-none"
                            placeholder="Example: find moments when we talked about the playoffs"
                        />
                    </div>
                    {/* Double-ended Slider */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-700 text-green-200 text-xs rounded px-2 py-0.5">
                                Credit saver
                            </span>
                            <span className="text-zinc-400 text-xs">
                                Processing timeframe
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-mono">
                                {secondsToHHMMSS(range[0])}
                            </span>
                            <div className="flex-1 px-2">
                                <Slider
                                    range
                                    min={0}
                                    max={vodDuration}
                                    value={range}
                                    onChange={handleSliderChange}
                                    step={1}
                                    trackStyle={[
                                        {
                                            backgroundColor: '#a78bfa',
                                            height: 6,
                                        },
                                    ]}
                                    handleStyle={[
                                        {
                                            borderColor: '#a78bfa',
                                            backgroundColor: '#fff',
                                            height: 20,
                                            width: 20,
                                            marginTop: -7,
                                        },
                                        {
                                            borderColor: '#a78bfa',
                                            backgroundColor: '#fff',
                                            height: 20,
                                            width: 20,
                                            marginTop: -7,
                                        },
                                    ]}
                                    railStyle={{
                                        backgroundColor: '#27272a',
                                        height: 6,
                                    }}
                                />
                            </div>
                            <span className="text-zinc-400 font-mono">
                                {secondsToHHMMSS(range[1])}
                            </span>
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-400 mt-4 text-sm">{error}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VodWorkflow;
