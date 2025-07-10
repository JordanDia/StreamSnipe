import subprocess
import json
import os
from collections import defaultdict
import numpy as np
from scipy.signal import find_peaks
from datetime import timedelta
from progress_state import current_progress
from concurrent.futures import ThreadPoolExecutor, as_completed


def download_chat(twitch_url, start_str, end_str):
    video_id = twitch_url.strip().split("/")[-1]
    
    print("[1] Downloading vod data...")

    current_progress["message"] = "Downloading vod data..."
    subprocess.run([
        "./TwitchDownloaderCLI",
        "chatdownload",
        "--id", video_id,
        "-o", "chat.json",
        "-b", start_str,
        "-e", end_str,
        "--collision", "Overwrite"
    ], check=True)
    current_progress["message"] = "Vod data downloaded successfully."

def analyze_chat():
    print("[2] Analyzing chat activity...")

    current_progress["message"] = "Finding hype moments..."

    with open("chat.json", "r", encoding="utf-8") as f:
        chat = json.load(f)

    msg_count = defaultdict(int)
    for comment in chat["comments"]:
        sec = int(comment["content_offset_seconds"])
        msg_count[sec] += 1

    max_sec = max(msg_count.keys())
    counts = [msg_count[i] for i in range(max_sec + 1)]

    derivative = np.diff(counts, prepend=0)
    peaks, _ = find_peaks(derivative, height=7)

    # Sort peaks by intensity
    peak_heights = [(p, derivative[p].item()) for p in peaks]
    peak_heights_sorted = sorted(peak_heights, key=lambda x: x[1], reverse=True)

    print("\nTop hype spikes:")
    for sec, height in peak_heights_sorted[:5]:
        print(f"Second {sec} — Derivative height: {height}")

    clip_windows = merge_clip_windows(peak_heights_sorted[:5])

    current_progress["message"] = "Hype moments found. Preparing clips..."
    return clip_windows

def segment_vod(msg_count, segment_length=600):  # 10 min = 600 sec
    max_sec = max(msg_count.keys())
    segments = []
    for start in range(0, max_sec, segment_length):
        end = min(start + segment_length, max_sec)
        segments.append((start, end))
    return segments

def analyze_segment(msg_count, start, end):
    counts = [msg_count[i] for i in range(start, end + 1)]
    derivative = np.diff(counts, prepend=0)
    peaks, _ = find_peaks(derivative, height=7)
    # Offset peaks by segment start
    peaks = [p + start for p in peaks]
    peak_heights = [(p, derivative[p - start].item()) for p in peaks]
    return sorted(peak_heights, key=lambda x: x[1], reverse=True)[:2]  # top 2 per segment

def build_msg_count():
    with open("chat.json", "r", encoding="utf-8") as f:
        chat = json.load(f)
    msg_count = defaultdict(int)
    for comment in chat["comments"]:
        sec = int(comment["content_offset_seconds"])
        msg_count[sec] += 1
    return msg_count

def global_peaks(msg_count):
    max_sec = max(msg_count.keys())
    counts = [msg_count[i] for i in range(max_sec + 1)]
    derivative = np.diff(counts, prepend=0)
    peaks, _ = find_peaks(derivative, height=7)
    peak_heights = [(p, derivative[p].item()) for p in peaks]
    return sorted(peak_heights, key=lambda x: x[1], reverse=True)[:5]  # top 5 global

def hybrid_analyze_chat():
    print("[2] Analyzing chat activity (hybrid)...")
    current_progress["message"] = "Finding hype moments (hybrid)..."
    msg_count = build_msg_count()
    # Global peaks
    global_peak_list = global_peaks(msg_count)
    # Local peaks
    segments = segment_vod(msg_count)
    local_peaks = []
    for start, end in segments:
        local_peaks.extend(analyze_segment(msg_count, start, end))
    # Merge and deduplicate
    all_peaks = global_peak_list + local_peaks
    # Remove duplicate seconds (keep highest intensity)
    peak_dict = {}
    for sec, height in all_peaks:
        if sec not in peak_dict or height > peak_dict[sec]:
            peak_dict[sec] = height
    all_peaks_dedup = [(sec, peak_dict[sec]) for sec in peak_dict]
    all_peaks_sorted = sorted(all_peaks_dedup, key=lambda x: x[1], reverse=True)
    clip_windows = merge_clip_windows(all_peaks_sorted)
    current_progress["message"] = "Hype moments found. Preparing clips..."
    return clip_windows


def merge_clip_windows(peaks, margin=30):
    # Create [start, end] windows around each peak
    windows = [(max(0, sec - 15), sec + 15) for sec, _ in peaks]
    
    # Sort by start time
    windows.sort()
    merged = []

    for window in windows:
        if not merged:
            merged.append(window)
        else:
            prev_start, prev_end = merged[-1]
            curr_start, curr_end = window

            # If windows overlap or are within `margin` seconds, merge them
            if curr_start <= prev_end + margin:
                merged[-1] = (prev_start, max(prev_end, curr_end))
            else:
                merged.append(window)

    return merged

def download_clip(twitch_url, start_sec, end_sec, index):
    start_str = str(timedelta(seconds=int(start_sec)))
    end_str = str(timedelta(seconds=int(end_sec)))
    temp_file = f"clips/temp_clip{index + 1}.mp4"
    output_file = f"clips/clip_{index + 1}.mp4"

    print(f"⬇️  Downloading clip {index + 1}: {start_str} to {end_str}...")

    current_progress["message"] = f"Downloading clip {index + 1}..."

    subprocess.run([
        "yt-dlp",
        twitch_url,
        "-f", "bestvideo[height=1080][fps=60]+bestaudio/best",
        "--download-sections", f"*{start_str}-{end_str}",
        "--concurrent-fragments", "5",
        "--fragment-retries", "1",
        "--no-cache-dir",
        "--force-overwrites",
        "-o", temp_file
    ], check=True)

    current_progress["message"] = f"Clip {index + 1} downloaded. Processing..."

    # Re-encode the clip to smooth playback and enable faststart
    subprocess.run([
        "ffmpeg",
        "-y",  # Overwrite if exists
        "-i", temp_file,
        "-ss", "00:00:00",  # Trim start cleanly (just in case)
        "-movflags", "faststart",
        "-preset", "ultrafast",
        "-c:v", "libx264",  # Re-encode video
        "-c:a", "aac",      # Re-encode audio
        "-b:a", "128k",
        output_file
    ], check=True)

    current_progress["message"] = f"Clip {index + 1} processed successfully."

    os.remove(temp_file)  # Clean up temporary file


def clip_hype_moments(windows, twitch_url):
    print("\n[3] Clipping hype moments (parallel)...")
    current_progress["message"] = "Clipping hype moments..."
    with ThreadPoolExecutor(max_workers=10) as executor:  # Adjust max_workers as needed
        futures = []
        for i, (start, end) in enumerate(windows):
            if end <= start:
                print(f"⚠️ Skipping clip_{i + 1}: invalid range.")
                continue
            futures.append(executor.submit(download_clip, twitch_url, start, end, i))
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"❌ Error downloading clip: {e}")
    print("✅ All clips downloaded.")
    current_progress["message"] = "All clips downloaded successfully."

def get_clips(twitch_url: str, start_time="00:00:00", end_time="00:00:30", project_id: str | None = None):
    if not os.path.exists("clips"):
        os.makedirs("clips")
        
    print(f"start time: {start_time}, end time: {end_time}")
    download_chat(twitch_url, start_time, end_time)

    clip_windows = hybrid_analyze_chat()

    clip_hype_moments(clip_windows, twitch_url)

    clip_files = [f"clips/clip_{i + 1}.mp4" for i in range(len(clip_windows))]

    current_progress["message"] = "Clips generated successfully."
    return clip_files