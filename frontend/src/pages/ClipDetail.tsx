import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, type UserClip } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

function secondsToHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

const ClipDetail = () => {
  const { user } = useAuth();
  const { clipId } = useParams();
  const navigate = useNavigate();
  const [clip, setClip] = useState<UserClip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const fetchClip = async () => {
      if (!user || !clipId) return;
      setLoading(true);
      try {
        const userClips = await database.getUserClips(user.id);
        const found = userClips.find(c => c.id === clipId);
        if (!found) {
          setError('Clip not found.');
        } else {
          setClip(found);
        }
      } catch (err) {
        setError('Failed to load clip.');
      } finally {
        setLoading(false);
      }
    };
    fetchClip();
  }, [user, clipId]);

  useEffect(() => {
    if (!clip) return;
    // Set initial slider values based on saved clip
    const start = hhmmssToSeconds(clip.start_time);
    const end = hhmmssToSeconds(clip.end_time);
    setStartTime(0);
    setEndTime(end - start);
  }, [clip]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => {
      setDuration(video.duration);
      setEndTime(video.duration);
    };
    video.addEventListener('loadedmetadata', handleLoaded);
    return () => video.removeEventListener('loadedmetadata', handleLoaded);
  }, [clip]);

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
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [endTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - startTime) > 0.3) {
      video.currentTime = startTime;
    }
  }, [startTime]);

  if (loading) {
    return <div className="pt-4 px-4 text-white">Loading...</div>;
  }
  if (error || !clip) {
    return <div className="pt-4 px-4 text-red-400">{error || 'Clip not found.'}</div>;
  }

  const handleDownload = async () => {
    if (!clip) return;
    if (startTime === undefined || endTime === undefined || startTime >= endTime) {
      alert('Please set start and end times before downloading.');
      return;
    }
    const start = secondsToHHMMSS(startTime);
    const end = secondsToHHMMSS(endTime);
    try {
      const response = await fetch('http://localhost:8000/download_clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: clip.clip_filename.replace('_cropped', ''),
          start_time: start,
          end_time: end
        }),
      });
      if (!response.ok) {
        alert('Error downloading clip.');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clip.vod_title || 'clip'}_${start.replace(/:/g, '-')}_${end.replace(/:/g, '-')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      alert('Download failed.');
    }
  };

  return (
    <div className="pt-4 px-4 min-h-screen flex flex-col items-center bg-[#18181b]">
      <div className="w-full max-w-2xl bg-[#23232a] rounded-2xl shadow-lg p-8 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Clips
        </button>
        <h1 className="text-2xl font-bold text-white mb-4 line-clamp-2">{clip.vod_title || 'Untitled Clip'}</h1>
        <video
          ref={videoRef}
          src={`http://localhost:8000/${clip.clip_path}`}
          controls
          className="w-full rounded-lg mb-4 bg-black"
        />
        <div className="flex items-center justify-between text-white mb-4">
          <button onClick={() => videoRef.current?.play()}>▶️</button>
          <button onClick={() => videoRef.current?.pause()}>⏸</button>
          <button onClick={() => videoRef.current && (videoRef.current.currentTime = 0)}>⏮️</button>
          <button onClick={() => videoRef.current && (videoRef.current.currentTime = duration)}>⏭️</button>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex flex-col space-y-2 mb-4">
          <label className="text-white">
            Start Time: {formatTime(startTime)}
          </label>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={startTime}
            onChange={e => setStartTime(Number(e.target.value))}
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
            onChange={e => setEndTime(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-gray-300 text-sm">
            <div>Time Range: {formatTime(startTime)} - {formatTime(endTime)}</div>
            <div>Duration: {endTime - startTime > 0 ? formatTime(endTime - startTime) : 'N/A'}</div>
            <div>File Size: N/A</div>
            <div>Created: {new Date(clip.processing_date).toLocaleDateString()}</div>
          </div>
          <button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white font-semibold transition-colors"
          >
            Download Selected Segment
          </button>
        </div>
      </div>
    </div>
  );
};

function hhmmssToSeconds(hhmmss: string): number {
  const [h, m, s] = hhmmss.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

export default ClipDetail; 