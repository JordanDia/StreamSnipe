import React, { useState, useRef } from 'react';

// Placeholder icons (replace with your preferred icon library later)
const HeartIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
);
const ThumbsDownIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.528-7.056A2 2 0 018.764 3h7.472a2 2 0 011.789 2.894l-3.528 7.056A2 2 0 0115.236 14H10zm0 0v6m0-6h4" /></svg>
);
const PlayIcon = () => (
  <svg width="40" height="40" fill="white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="20" fill="rgba(0,0,0,0.5)"/><polygon points="10,8 16,12 10,16" fill="white"/></svg>
);
const PublishIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const DownloadIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
);
const EditIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V21h8" /></svg>
);

interface ClipsGridProps {
  clips: string[];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const CustomPlayButton = () => (
  <svg width="56" height="56" viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="28" fill="white" />
    <polygon points="22,18 40,28 22,38" fill="rgba(0,0,0,0.7)" />
  </svg>
);

const CustomPauseButton = () => (
  <svg width="56" height="56" viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="28" fill="white" />
    <rect x="20" y="18" width="6" height="20" rx="2" fill="rgba(0,0,0,0.7)" />
    <rect x="30" y="18" width="6" height="20" rx="2" fill="rgba(0,0,0,0.7)" />
  </svg>
);

const ClipsGrid: React.FC<ClipsGridProps> = ({ clips }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [videoStates, setVideoStates] = useState<{ [idx: number]: { currentTime: number; duration: number } }>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handlePlayPause = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (playingIdx === idx && !video.paused) {
      video.pause();
      setPlayingIdx(null);
    } else {
      // Pause any other playing video
      if (playingIdx !== null && videoRefs.current[playingIdx]) {
        videoRefs.current[playingIdx]?.pause();
      }
      video.play();
      setPlayingIdx(idx);
    }
  };

  const handleTimeUpdate = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    setVideoStates((prev) => ({
      ...prev,
      [idx]: {
        currentTime: video.currentTime,
        duration: video.duration || 0,
      },
    }));
  };

  const handleLoadedMetadata = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    setVideoStates((prev) => ({
      ...prev,
      [idx]: {
        currentTime: 0,
        duration: video.duration || 0,
      },
    }));
  };

  if (!clips || clips.length === 0) {
    return (
      <div className="p-8 min-h-screen bg-background-dark text-white">
        <h2 className="text-xl font-normal mb-6">Clips (0)</h2>
        <div className="text-zinc-400">No clips found.</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-background-dark text-white">
      <h2 className="text-xl font-normal mb-6">Clips ({clips.length})</h2>
      <div className="grid grid-cols-6 gap-6">
        {clips.map((clip, idx) => {
          const filename = clip.replace('clips/', '');
          const src = `http://localhost:8000/${clip}?v=${idx}`;
          const state = videoStates[idx] || { currentTime: 0, duration: 0 };
          const isPlaying = playingIdx === idx;
          return (
            <div
              key={clip}
              className={`relative rounded-lg overflow-hidden bg-zinc-900 transition-colors duration-200 ${hovered === idx ? 'bg-zinc-200' : ''}`}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{ minHeight: 320 }}
            >
              {/* Like/Dislike buttons (hover) */}
              {hovered === idx && (
                <div className="absolute flex flex-col gap-2 left-2 top-2 z-20">
                  <button className="bg-white/80 hover:bg-white text-red-500 rounded-full p-2 shadow"><HeartIcon /></button>
                  <button className="bg-white/80 hover:bg-white text-zinc-700 rounded-full p-2 shadow"><ThumbsDownIcon /></button>
                </div>
              )}
              {/* Duration (always top right) */}
              <div className="absolute right-2 top-2 z-20 bg-black/70 text-xs px-2 py-1 rounded font-mono flex gap-1">
                <span>{formatTime(state.currentTime)}</span>
                <span>/</span>
                <span>{formatTime(state.duration)}</span>
              </div>
              {/* Thumbnail or video */}
              <div className="relative w-full h-72 flex items-center justify-center bg-black">
                <video
                  ref={el => { videoRefs.current[idx] = el; }}
                  src={src}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  controls={false}
                  onTimeUpdate={() => handleTimeUpdate(idx)}
                  onLoadedMetadata={() => handleLoadedMetadata(idx)}
                  onEnded={() => setPlayingIdx(null)}
                  style={{ cursor: 'pointer' }}
                />
                {hovered === idx && !isPlaying && (
                  <button
                    className="absolute inset-0 flex items-center justify-center z-10"
                    onClick={e => { e.stopPropagation(); handlePlayPause(idx); }}
                  >
                    <CustomPlayButton />
                  </button>
                )}
                {hovered === idx && isPlaying && (
                  <button
                    className="absolute inset-0 flex items-center justify-center z-10"
                    onClick={e => { e.stopPropagation(); handlePlayPause(idx); }}
                  >
                    <CustomPauseButton />
                  </button>
                )}
              </div>
              {/* Score and action icons */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-900">
                <span className="text-green-400 font-bold text-lg">99</span>
                <div className="flex gap-3">
                  <button className="hover:text-blue-400"><PublishIcon /></button>
                  <button className="hover:text-blue-400"><DownloadIcon /></button>
                  <button className="hover:text-blue-400"><EditIcon /></button>
                </div>
              </div>
              {/* Title */}
              <div className="px-3 pb-3 text-sm text-white truncate">
                {filename}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClipsGrid; 