import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface UserData {
    id: string;
    display_name: string;
    profile_image: string;
    follower_count: number;
}

interface VodData {
    id: string;
    url: string;
    title: string;
    duration: string;
    thumbnail_url?: string;
    created_at: string;
    view_count?: number;
}

const Channel = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [vods, setVods] = useState<VodData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the optimized combined endpoint
                const response = await fetch(
                    `http://localhost:8000/api/get-channel-data?username=${username}`
                );

                if (!response.ok)
                    throw new Error(
                        `API error: ${response.status} ${response.statusText}`
                    );

                const data = await response.json();

                if (data.error) throw new Error(data.error);

                setUserData(data.user);
                setVods(data.vods);
                setLoading(false);
            } catch (err: unknown) {
                console.error(err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred'
                );
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const handleVodClick = (vod: VodData) => {
        navigate(`/workflow`, { state: { vodData: { ...vod, display_name: userData?.display_name } } });
    };

    const formatDuration = (duration: string) => {
        return duration.replace(/(\d+)([hms])/g, '$1$2 ').trim();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatViews = (views?: number) => {
        if (!views) return '0 views';
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
        return `${views} views`;
    };

    const formatFollowers = (followers: number) => {
        if (followers >= 1000000)
            return `${(followers / 1000000).toFixed(1)}M followers`;
        if (followers >= 1000)
            return `${(followers / 1000).toFixed(1)}K followers`;
        return `${followers} followers`;
    };

    const getTwitchThumbnail = (videoId: string) => {
        // Fallback thumbnail URL if API doesn't provide one
        return `https://static-cdn.jtvnw.net/cf_vods/${videoId}/thumb/thumb0-320x180.jpg`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ArrowPathIcon className="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <div className="text-white pt-4 px-4">
            {/* Centered Profile Header */}
            <div className="flex justify-center mb-8">
                <div
                    className="flex items-center px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() =>
                        window.open(
                            `https://www.twitch.tv/${username}`,
                            '_blank'
                        )
                    }
                >
                    <div className="relative">
                        <img
                            src={userData.profile_image}
                            alt={`${userData.display_name}'s profile`}
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        
                    </div>
                    <div className="ml-4 flex flex-col justify-center transform -translate-y-1">
                        <div className="flex items-center mb-2">
                            <h1 className="text-base font-bold text-white leading-tight">
                                {userData.display_name}
                            </h1>
                            <svg
                                className="w-4 h-4 ml-1 text-purple-500 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <p className="text-zinc-400 text-xs leading-tight">
                            {formatFollowers(userData.follower_count)}
                        </p>
                    </div>
                </div>
            </div>


            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {vods.map((vod) => (
                    <div
                        key={vod.id}
                        onClick={() => handleVodClick(vod)}
                        className="relative group cursor-pointer"
                    >
                        <div className="relative">
                            <img
                                src={
                                    vod.thumbnail_url ||
                                    getTwitchThumbnail(vod.id)
                                }
                                alt={vod.title}
                                className="w-full aspect-video object-cover rounded-lg"
                                onError={(e) => {
                                    // Fallback to placeholder if thumbnail fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const placeholder =
                                        target.nextElementSibling as HTMLElement;
                                    if (placeholder) {
                                        placeholder.classList.remove('hidden');
                                    }
                                }}
                            />
                            <div className="w-full aspect-video bg-zinc-700 rounded-lg flex items-center justify-center hidden">
                                <span className="text-zinc-400">
                                    No thumbnail
                                </span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-1 py-0.5 text-xs rounded">
                                {formatDuration(vod.duration)}
                            </div>
                        </div>
                        <div className="flex mt-3">
                            <div className="flex-grow">
                                <h3 className="font-medium text-sm line-clamp-2 text-white">
                                    {vod.title}
                                </h3>
                                <div className="flex items-center mt-1">
                                    <span className="text-zinc-400 text-xs">
                                        {userData.display_name}
                                    </span>
                                    <svg
                                        className="w-3 h-3 ml-1 text-purple-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="flex text-xs text-zinc-400 mt-0.5">
                                    <span>{formatViews(vod.view_count)}</span>
                                    <span className="mx-1">•</span>
                                    <span>{formatDate(vod.created_at)}</span>
                                </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <svg
                                    className="w-5 h-5 text-zinc-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Channel;
