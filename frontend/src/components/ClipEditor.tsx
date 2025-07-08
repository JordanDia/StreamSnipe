import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { database } from "../lib/database";

type Props = {
    src: string;
    filename: string;
};

function secondsToHHMMSS(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
}


export default function ClipEditor({ src, filename }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { user } = useAuth();
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoaded = () => {
                setDuration(video.duration);
                setEndTime(video.duration);
            };
            video.addEventListener("loadedmetadata", handleLoaded);
            return () => video.removeEventListener("loadedmetadata", handleLoaded);
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.currentTime > endTime) {
                video.pause();
                video.currentTime = endTime;
            }
        };

        video.addEventListener("timeupdate", onTimeUpdate);
        return () => video.removeEventListener("timeupdate", onTimeUpdate);
    }, [endTime]);

    // Seek video to new start time when adjusted
    useEffect(() => {
        const video = videoRef.current;
        if (video && Math.abs(video.currentTime - startTime) > 0.3) {
            video.currentTime = startTime;
        }
    }, [startTime]);

    const handleDownload = async () => {
        if (!filename) {
            alert("No clip selected to download.");
            return;
        }
        if (startTime === undefined || endTime === undefined || startTime >= endTime) {
            alert("Please set start and end times before downloading.");
            return;
        }

        const start = secondsToHHMMSS(startTime);
        const end = secondsToHHMMSS(endTime);

        try {
            const response = await fetch("http://localhost:8000/download_clip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename,
                    start_time: start,
                    end_time: end
                }),
            });

            if (!response.ok) {
                alert("Error downloading clip.");
                return;
            }


            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create and click the download link
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}_cropped.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Delay revoking to ensure download finishes
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000); // 1s delay

        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const handleSaveToLibrary = async () => {
        if (!user) {
            alert("Please sign in to save clips to your library.");
            return;
        }

        if (!filename) {
            alert("No clip selected to save.");
            return;
        }

        // Always save a 3-minute segment starting at the user's selected start time
        const threeMinutes = 180;
        const saveStart = startTime;
        const saveEnd = Math.min(startTime + threeMinutes, duration);
        const saveDuration = saveEnd - saveStart;
        const start = secondsToHHMMSS(saveStart);
        const end = secondsToHHMMSS(saveEnd);

        try {
            const clipData = {
                user_id: user.id,
                clip_filename: `${filename}_cropped.mp4`,
                clip_path: `clips/${filename}`,
                original_vod_url: "", // Could be passed as prop
                vod_title: filename,
                start_time: start,
                end_time: end,
                processing_date: new Date().toISOString(),
                clip_duration_seconds: saveDuration,
                status: 'completed' as const,
                error_message: undefined,
                file_size_bytes: 0
            };
            
            await database.createUserClip(clipData);
            setSaved(true);
            
            // Update analytics
            const analytics = await database.getUserAnalytics(user.id);
            await database.updateUserAnalytics(user.id, {
                total_clips_created: (analytics?.total_clips_created || 0) + 1,
                clips_created_this_month: (analytics?.clips_created_this_month || 0) + 1,
                last_activity_date: new Date().toISOString()
            });
            
        } catch (error) {
            console.error("Error saving clip:", error);
            alert("Failed to save clip to library.");
        }
    };

    return (
        <div className="bg-secondary p-4 rounded-lg shadow space-y-4">
            <video ref={videoRef} src={src} controls className="w-full rounded" />

            <div className="flex items-center justify-between text-white">
                <button onClick={() => videoRef.current?.play()}>▶️</button>
                <button onClick={() => videoRef.current?.pause()}>⏸</button>
                <button onClick={() => videoRef.current && (videoRef.current.currentTime = 0)}>⏮️</button>
                <button onClick={() => videoRef.current && (videoRef.current.currentTime = duration)}>⏭️</button>
                <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-white">
                    Start Time: {formatTime(startTime)}
                </label>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                />

                <label className="text-white">
                    End Time: {formatTime(endTime)}
                </label>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
                >
                    Download Cropped Clip
                </button>
                
                {user && (
                    <button
                        onClick={handleSaveToLibrary}
                        disabled={saved}
                        className={`px-4 py-2 rounded text-white font-semibold ${
                            saved 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                    >
                        {saved ? '✓ Saved to Library' : 'Save to Library'}
                    </button>
                )}
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${mins}:${secs}`;
}
