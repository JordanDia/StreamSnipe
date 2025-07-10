from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from typing import AsyncGenerator
from pydantic import BaseModel
import os
import shutil
import subprocess
import asyncio
import requests
import time
import concurrent.futures
from uuid import uuid4
from supabase import create_client, Client

from pydantic import BaseModel
from generate_clips import get_clips

from progress_state import current_progress
from dotenv import load_dotenv
load_dotenv()

CLIENT_ID = "j6hsb1u060lxdhbyz8n5lmwgl2rxq0"
CLIENT_SECRET = "7du2zywv9ioy5fsah9r6vm29loy5yy"

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "your_service_key")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Token caching
_cached_token = None
_token_expiry = 0

# todo: MAKE PAGE THAT SHOW VODS LOOK BETTER
#       ADD ACCOUNT FUNCTIONALITY
#       LONG TERM: ADD AI TO ANALYZE VIDEOS
# test: https://www.twitch.tv/videos/2482589381
# start: 01:32:00
# end: 02:46:00

# user data
# {'id': '233300375', 'login': 'clix', 'display_name': 'Clix', 'type': '', 'broadcaster_type': 'partner', 
# 'description': 'Hi, my name is Cody (Clix), I am a pro fortnite player (and the guy from Fortnite) who loves to stream and interact with fans. 
# I stream whenever I can, and It would mean the world to me if you guys hit the follow button! ', 
# 'profile_image_url': 'https://static-cdn.jtvnw.net/jtv_user_pictures/f700cd74-e74c-42a4-ba5b-18efb486eb92-profile_image-300x300.png', 
# 'offline_image_url': 'https://static-cdn.jtvnw.net/jtv_user_pictures/4abb162b-687a-4173-bc4e-054b4d4fb3f3-channel_offline_image-1920x1080.jpeg', 
# 'view_count': 0, 'created_at': '2018-06-22T14:48:00Z'}

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or wherever your React dev server runs
    allow_methods=["*"],
    allow_headers=["*"],
)

class VODRequest(BaseModel):
    twitch_url: str
    start_time: str = "00:00:00"
    end_time: str = "00:00:00"
    user_id: str  # Add user_id for project association
    vod_title: str = ""
    vod_thumbnail: str = ""
    vod_username: str = ""  # Add username field

# Remove in-memory project store since we're using Supabase now
# user_projects = {}

clips_dir = os.path.join(os.getcwd(), "clips")
# Create clips directory if it doesn't exist (don't delete existing clips)
os.makedirs(clips_dir, exist_ok=True)
app.mount("/clips", StaticFiles(directory=clips_dir), name="clips") 

@app.post("/clips")
async def process_vod(data: VODRequest):
    # Generate a unique project ID
    project_id = str(uuid4())
    
    # Create user/project-specific clips directory
    user_dir = os.path.join("clips", data.user_id)
    project_dir = os.path.join(user_dir, project_id)
    os.makedirs(project_dir, exist_ok=True)

    # Save project to Supabase immediately with "In queue" status
    project_data = {
        "id": project_id,
        "user_id": data.user_id,
        "vod_url": data.twitch_url,
        "vod_title": data.vod_title,
        "vod_thumbnail": data.vod_thumbnail,
        "vod_username": data.vod_username,
        "status": "In queue",
        "created_at": "now()"
    }
    
    try:
        # Insert project into user_projects table
        print(f"Creating project in Supabase: {project_id}")
        result = supabase.table("user_projects").insert(project_data).execute()
        print(f"Project created successfully: {result.data}")
    except Exception as e:
        print(f"Error creating project in Supabase: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")

    # Start async processing
    asyncio.create_task(process_clips_async(project_id, data, project_dir))
    
    return {"project_id": project_id, "status": "In queue"}

async def process_clips_async(project_id: str, data: VODRequest, project_dir: str):
    try:
        # Update status to "Processing"
        supabase.table("user_projects").update({"status": "Processing"}).eq("id", project_id).execute()
        
        # Generate clips
        clips = get_clips(data.twitch_url, data.start_time, data.end_time, project_id)
        
        # Move clips to user/project directory
        saved_clips = []
        for i, clip_path in enumerate(clips):
            dest = os.path.join(project_dir, f"clip_{i+1}.mp4")
            os.rename(clip_path, dest)
            saved_clips.append(dest)

        # Insert clips into project_clips table
        for i, clip_path in enumerate(saved_clips):
            clip_data = {
                "project_id": project_id,
                "clip_url": clip_path,
                "clip_index": i + 1
            }
            print(f"Saving clip {i+1}: {clip_path}")
            clip_response = supabase.table("project_clips").insert(clip_data).execute()
            print(f"Clip saved successfully: {clip_response.data}")
        
        # Update status to "Expires in 7 days"
        supabase.table("user_projects").update({"status": "Expires in 7 days"}).eq("id", project_id).execute()
        
    except Exception as e:
        print(f"Error processing clips: {e}")
        # Update status to "Failed to generate clips"
        supabase.table("user_projects").update({"status": "Failed to generate clips"}).eq("id", project_id).execute()

class ClipDownloadRequest(BaseModel):
    filename: str
    start_time: str
    end_time: str

@app.post("/download_clip")
def download_clip(data: ClipDownloadRequest):
    input_path = f"./clips/{data.filename}"
    temp_path = f"./clips/temp_{data.filename}"
    output_path = f"./clips/cropped_{data.filename}"

    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="Clip file not found")

    # Step 1: Crop the clip using ffmpeg
    try:
        subprocess.run([
            "ffmpeg",
            "-y",
            "-ss", data.start_time,
            "-to", data.end_time,
            "-i", input_path,
            "-c", "copy",
            temp_path
        ], check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"FFmpeg cropping error: {e}")

    # Step 2: Remux to improve playback smoothness and enable faststart
    try:
        subprocess.run([
            "ffmpeg",
            "-y",
            "-i", temp_path,
            "-ss", "00:00:00",
            "-movflags", "faststart",
            "-preset", "ultrafast",
            "-c:v", "libx264",
            "-c:a", "aac",
            "-b:a", "128k",
            output_path
        ], check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"FFmpeg remuxing error: {e}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return FileResponse(output_path, filename=f"cropped_{data.filename}")

@app.get("/status")
def get_status():
    return {"status": current_progress["message"]}

@app.get("/project-status/{project_id}")
def get_project_status(project_id: str):
    try:
        response = supabase.table("user_projects").select("status").eq("id", project_id).single().execute()
        if response.data:
            return {"status": response.data["status"]}
        else:
            raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        print(f"Error fetching project status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project status")

@app.get("/projects/{user_id}")
def get_user_projects(user_id: str):
    try:
        # Fetch ALL projects for the user, including 'In queue', 'Processing', and completed
        response = supabase.table("user_projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        projects = response.data
        
        
        # For each project, fetch its clips
        for project in projects:
            clips_response = supabase.table("project_clips").select("clip_url").eq("project_id", project["id"]).order("clip_index").execute()
            # Only include clips that actually exist on the file system
            existing_clips = []
            if clips_response.data:
                for clip in clips_response.data:
                    clip_path = clip["clip_url"]
                    if os.path.exists(clip_path):
                        existing_clips.append(clip_path)
                    else:
                        print(f"Warning: Clip file not found: {clip_path}")
            project["clips"] = existing_clips
            # Add project_id field for frontend compatibility
            project["project_id"] = project["id"]
        
        return projects
    except Exception as e:
        print(f"Error fetching projects from Supabase: {e}")
        return []

@app.get("/project_clips/{user_id}/{project_id}")
def get_project_clips(user_id: str, project_id: str):
    try:
        # Fetch project details
        project_response = supabase.table("user_projects").select("*").eq("id", project_id).eq("user_id", user_id).single().execute()
        
        if not project_response.data:
            return {"clips": [], "status": "Not found"}
        
        project = project_response.data
        
        # Fetch clips for this project
        clips_response = supabase.table("project_clips").select("*").eq("project_id", project_id).order("clip_index").execute()
        
        clips = [clip["clip_url"] for clip in clips_response.data] if clips_response.data else []
        
        return {
            "clips": clips, 
            "status": project["status"], 
            "vod_title": project["vod_title"], 
            "vod_thumbnail": project["vod_thumbnail"], 
            "vod_username": project.get("vod_username", "")
        }
    except Exception as e:
        print(f"Error fetching project clips from Supabase: {e}")
        return {"clips": [], "status": "Not found"}

@app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str):
    try:
        # Fetch project to get user_id and project_dir
        project_response = supabase.table("user_projects").select("*").eq("id", project_id).single().execute()
        if not project_response.data:
            raise HTTPException(status_code=404, detail="Project not found")
        project = project_response.data
        user_id = project["user_id"]
        # Delete all associated clips from project_clips
        supabase.table("project_clips").delete().eq("project_id", project_id).execute()
        # Delete the project from user_projects
        supabase.table("user_projects").delete().eq("id", project_id).execute()
        # Remove files from disk
        project_dir = os.path.join("clips", str(user_id), str(project_id))
        if os.path.exists(project_dir):
            import shutil
            shutil.rmtree(project_dir)
        return {"message": "Project deleted"}
    except Exception as e:
        print(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")

# Get token (cache this in production)
def get_app_token():
    global _cached_token, _token_expiry
    current_time = time.time()

    if _cached_token and current_time < _token_expiry:
        return _cached_token

    url = "https://id.twitch.tv/oauth2/token"
    params = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    resp = requests.post(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    if "access_token" not in data:
        raise RuntimeError("Failed to get Twitch access token")
    
    _cached_token = data["access_token"]
    _token_expiry = current_time + data["expires_in"] - 60 # Expire 60 seconds before the actual expiry
    return _cached_token

@app.get("/api/get-channel-vods")
def get_channel_vods(username: str):
    token = get_app_token()
    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {token}"
    }

    # Get user ID
    user_url = "https://api.twitch.tv/helix/users"
    params = {"login": username}
    user_resp = requests.get(user_url, headers=headers, params=params)
    user_data = user_resp.json()["data"]

    if not user_data:
        return {"error": "User not found"}

    user_id = user_data[0]["id"]
    profile_image = user_data[0]["profile_image_url"]
    display_name = user_data[0]["display_name"]
    
    # Parallelize user info and follower count fetches
    def get_followers():
        followers_url = "https://api.twitch.tv/helix/channels/followers"
        followers_params = {"broadcaster_id": user_id, "first": 1}
        followers_resp = requests.get(followers_url, headers=headers, params=followers_params)
        return followers_resp.json().get("total", 0)

    def get_vods():
        vods_url = "https://api.twitch.tv/helix/videos"
        vod_params = {
            "user_id": user_id,
            "type": "archive"
        }
        vod_resp = requests.get(vods_url, headers=headers, params=vod_params)
        return vod_resp.json()["data"]

    # Execute both requests in parallel
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        followers_future = executor.submit(get_followers)
        vods_future = executor.submit(get_vods)
        
        follower_count = followers_future.result()
        vod_data = vods_future.result()
    
    # Batch fetch VOD details instead of individual calls
    detailed_vods = []
    if vod_data:
        # Create batches of up to 100 VOD IDs (Twitch API limit)
        vod_ids = [vod["id"] for vod in vod_data]
        batched_vods = []
        
        for i in range(0, len(vod_ids), 100):
            batch_ids = vod_ids[i:i+100]
            video_url = "https://api.twitch.tv/helix/videos"
            video_params = {"id": batch_ids}
            video_resp = requests.get(video_url, headers=headers, params=video_params)
            batch_details = video_resp.json()["data"]
            batched_vods.extend(batch_details)
        
        # Process the detailed VODs
        for detailed_vod in batched_vods:
            thumbnail_url = detailed_vod.get('thumbnail_url')
            
            # If we have a thumbnail_url, replace the template variables with actual dimensions
            if thumbnail_url:
                # The API returns URLs with template variables like %{width}x%{height}
                # Replace them with actual dimensions
                thumbnail_url = thumbnail_url.replace('%{width}x%{height}', '320x180')
                detailed_vod['thumbnail_url'] = thumbnail_url
            
            detailed_vods.append(detailed_vod)
    else:
        # Fallback to original data if no detailed info available
        detailed_vods = vod_data

    return {
        "user": {
            "id": user_id,
            "display_name": display_name,
            "profile_image": profile_image,
            "follower_count": follower_count,
        },
        "vods": detailed_vods
    }

@app.get("/api/get-channel-info")
def get_channel_info(username: str):
    token = get_app_token()
    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {token}"
    }

    # Get user ID
    user_url = "https://api.twitch.tv/helix/users"
    params = {"login": username}
    user_resp = requests.get(user_url, headers=headers, params=params)
    user_data = user_resp.json()["data"]

    if not user_data:
        return {"error": "User not found"}

    user_id = user_data[0]["id"]
    profile_image = user_data[0]["profile_image_url"]
    display_name = user_data[0]["display_name"]

    # Get follower count (this is already fast since we only need the count)
    followers_url = "https://api.twitch.tv/helix/channels/followers"
    followers_params = {"broadcaster_id": user_id, "first": 1}
    followers_resp = requests.get(followers_url, headers=headers, params=followers_params)
    follower_count = followers_resp.json().get("total", 0)

    return {
        "user": {
            "id": user_id,
            "display_name": display_name,
            "profile_image": profile_image,
            "follower_count": follower_count,
        }
    }

@app.get("/api/get-channel-data")
def get_channel_data(username: str):
    """
    Combined endpoint that fetches both channel info and VODs in parallel.
    This can be faster than calling get-channel-info and get-channel-vods separately.
    """
    token = get_app_token()
    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {token}"
    }

    # Get user ID
    user_url = "https://api.twitch.tv/helix/users"
    params = {"login": username}
    user_resp = requests.get(user_url, headers=headers, params=params)
    user_data = user_resp.json()["data"]

    if not user_data:
        return {"error": "User not found"}

    user_id = user_data[0]["id"]
    profile_image = user_data[0]["profile_image_url"]
    display_name = user_data[0]["display_name"]
    
    # Parallelize all API calls
    def get_followers():
        followers_url = "https://api.twitch.tv/helix/channels/followers"
        followers_params = {"broadcaster_id": user_id, "first": 1}
        followers_resp = requests.get(followers_url, headers=headers, params=followers_params)
        return followers_resp.json().get("total", 0)

    def get_vods():
        vods_url = "https://api.twitch.tv/helix/videos"
        vod_params = {
            "user_id": user_id,
            "type": "archive"
        }
        vod_resp = requests.get(vods_url, headers=headers, params=vod_params)
        return vod_resp.json()["data"]

    # Execute both requests in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        followers_future = executor.submit(get_followers)
        vods_future = executor.submit(get_vods)
        
        follower_count = followers_future.result()
        vod_data = vods_future.result()
    
    # Batch fetch VOD details instead of individual calls
    detailed_vods = []
    if vod_data:
        # Create batches of up to 100 VOD IDs (Twitch API limit)
        vod_ids = [vod["id"] for vod in vod_data]
        batched_vods = []
        
        for i in range(0, len(vod_ids), 100):
            batch_ids = vod_ids[i:i+100]
            video_url = "https://api.twitch.tv/helix/videos"
            video_params = {"id": batch_ids}
            video_resp = requests.get(video_url, headers=headers, params=video_params)
            batch_details = video_resp.json()["data"]
            batched_vods.extend(batch_details)
        
        # Create a mapping of VOD ID to detailed VOD data to preserve order
        vod_details_map = {vod["id"]: vod for vod in batched_vods}
        
        # Process the detailed VODs in the original order
        for original_vod in vod_data:
            vod_id = original_vod["id"]
            if vod_id in vod_details_map:
                detailed_vod = vod_details_map[vod_id]
                thumbnail_url = detailed_vod.get('thumbnail_url')
                
                # If we have a thumbnail_url, replace the template variables with actual dimensions
                if thumbnail_url:
                    # The API returns URLs with template variables like %{width}x%{height}
                    # Replace them with actual dimensions
                    thumbnail_url = thumbnail_url.replace('%{width}x%{height}', '320x180')
                    detailed_vod['thumbnail_url'] = thumbnail_url
                
                detailed_vods.append(detailed_vod)
            else:
                # Fallback to original data if detailed info not found
                detailed_vods.append(original_vod)
    else:
        # Fallback to original data if no detailed info available
        detailed_vods = vod_data

    return {
        "user": {
            "id": user_id,
            "display_name": display_name,
            "profile_image": profile_image,
            "follower_count": follower_count,
        },
        "vods": detailed_vods
    }

@app.get("/api/get-vod-info")
def get_vod_info(vod_id: str):
    token = get_app_token()
    video_url = "https://api.twitch.tv/helix/videos"
    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {token}"
    }
    params = {"id": vod_id}
    video_resp = requests.get(video_url, headers=headers, params=params)
    video_data = video_resp.json()["data"]

    if not video_data:
        return {"error": "VOD not found"}

    vod = video_data[0]
    # Replace thumbnail template variables
    thumbnail_url = vod.get('thumbnail_url', '').replace('%{width}x%{height}', '320x180')
    vod['thumbnail_url'] = thumbnail_url

    # Return only the fields your frontend expects
    return {
        "url": f"https://www.twitch.tv/videos/{vod_id}",
        "thumbnail_url": thumbnail_url,
        "duration": vod.get("duration"),
        "title": vod.get("title"),
        "display_name": vod.get("user_name"),
        "user_login": vod.get("user_login"),
        "user_id": vod.get("user_id"),
    }