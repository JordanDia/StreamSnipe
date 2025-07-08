# Backend Supabase Integration Guide

## Overview

This guide shows how to integrate your FastAPI backend with Supabase to track user clips and analytics.

## 1. Install Supabase Python Client

```bash
pip install supabase
```

## 2. Add Supabase Configuration

Add to your `main.py`:

```python
from supabase import create_client, Client
import os

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "your_service_key")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
```

## 3. Update Clip Processing to Save User Data

Modify your `/clips` endpoint to save clip data:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user from JWT token"""
    try:
        # Verify JWT token with Supabase
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/clips")
async def process_vod(data: VODRequest, current_user = Depends(get_current_user)):
    # Process clips as before
    clips = get_clips(data.twitch_url, data.start_time, data.end_time)
    
    # Save clip data to Supabase
    for i, clip_path in enumerate(clips):
        clip_data = {
            "user_id": current_user.id,
            "clip_filename": os.path.basename(clip_path),
            "clip_path": clip_path,
            "original_vod_url": data.twitch_url,
            "start_time": data.start_time,
            "end_time": data.end_time,
            "status": "completed",
            "clip_duration_seconds": 30,  # Calculate actual duration
            "file_size_bytes": os.path.getsize(clip_path) if os.path.exists(clip_path) else 0
        }
        
        supabase.table("user_clips").insert(clip_data).execute()
    
    # Update user analytics
    analytics_update = {
        "total_clips_created": supabase.rpc("increment_clip_count", {"user_id": current_user.id}),
        "last_activity_date": "now()"
    }
    
    supabase.table("user_analytics").update(analytics_update).eq("user_id", current_user.id).execute()
    
    return {"clips": clips}
```

## 4. Add User Settings Endpoints

```python
@app.get("/api/user/settings")
async def get_user_settings(current_user = Depends(get_current_user)):
    """Get user settings"""
    response = supabase.table("user_settings").select("*").eq("user_id", current_user.id).execute()
    return response.data[0] if response.data else None

@app.put("/api/user/settings")
async def update_user_settings(settings: dict, current_user = Depends(get_current_user)):
    """Update user settings"""
    response = supabase.table("user_settings").update(settings).eq("user_id", current_user.id).execute()
    return response.data[0] if response.data else None
```

## 5. Add User Analytics Endpoints

```python
@app.get("/api/user/analytics")
async def get_user_analytics(current_user = Depends(get_current_user)):
    """Get user analytics"""
    response = supabase.table("user_analytics").select("*").eq("user_id", current_user.id).execute()
    return response.data[0] if response.data else None

@app.get("/api/user/clips")
async def get_user_clips(current_user = Depends(get_current_user), limit: int = 50):
    """Get user clips"""
    response = supabase.table("user_clips").select("*").eq("user_id", current_user.id).order("created_at", desc=True).limit(limit).execute()
    return response.data
```

## 6. Environment Variables

Add to your `.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

## 7. Frontend Integration

Update your frontend API calls to include authentication:

```typescript
// In your API calls, include the auth token
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch("http://localhost:8000/clips", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session?.access_token}`
  },
  body: JSON.stringify(clipData)
})
```

## 8. Usage Limits Implementation

```python
async def check_user_limits(current_user):
    """Check if user has exceeded usage limits"""
    analytics = supabase.table("user_analytics").select("*").eq("user_id", current_user.id).execute()
    
    if analytics.data:
        user_analytics = analytics.data[0]
        
        # Free tier: 10 clips per month
        if user_analytics["clips_created_this_month"] >= 10:
            raise HTTPException(status_code=429, detail="Monthly clip limit exceeded")
        
        # Storage limit: 1GB
        if user_analytics["total_storage_used_bytes"] >= 1024 * 1024 * 1024:
            raise HTTPException(status_code=429, detail="Storage limit exceeded")
    
    return True
```

## 9. Testing

1. Set up the database schema in Supabase
2. Add environment variables
3. Test user registration and login
4. Test clip creation with user tracking
5. Verify data appears in dashboard

## 10. Production Considerations

- Use environment variables for all secrets
- Implement proper error handling
- Add request rate limiting
- Monitor database performance
- Set up logging for debugging 