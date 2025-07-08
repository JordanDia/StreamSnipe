# TwitchClip - VOD Clipping Dashboard

A modern web application for creating and managing Twitch VOD clips with a React frontend and FastAPI backend.

## Features

- 🎬 **VOD Clipping**: Create clips from Twitch VODs with custom start/end times
- 📁 **Project Management**: Organize clips into projects with persistent storage
- 👤 **User Authentication**: Secure user accounts with Supabase Auth
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 💾 **Persistent Storage**: Projects and clips saved to Supabase database
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Supabase** for authentication and database

### Backend
- **FastAPI** (Python) for the API server
- **Supabase** for database and authentication
- **Twitch API** for VOD data
- **FFmpeg** for video processing

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- FFmpeg installed on your system
- Supabase account and project

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd TwitchClip
```

### 2. Set up the Backend

```bash
cd backend
python -m venv venv
venv/Scripts/activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set up Supabase Database

Run the following SQL in your Supabase SQL editor:

```sql
-- user_projects table
create table user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  vod_url text not null,
  vod_title text,
  vod_thumbnail text,
  vod_username text,
  status text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- project_clips table
create table project_clips (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references user_projects(id) on delete cascade,
  clip_url text not null,
  clip_index integer,
  created_at timestamp with time zone default timezone('utc', now())
);
```

## Running the Application

### Start the Backend
```bash
cd backend
venv/Scripts/activate
python -m uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Sign up/Login**: Create an account or sign in with your existing account
2. **Search for Channels**: Use the search bar to find Twitch channels
3. **Select a VOD**: Choose a VOD from the channel's archive
4. **Set Clip Times**: Use the time slider to set start and end times
5. **Create Clip**: Click "Create Clip" to generate your clip
6. **View Projects**: Access your clips from the project list
7. **Download Clips**: Download individual clips as needed

## Project Structure

```
TwitchClip/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API server
│   ├── generate_clips.py   # Clip generation logic
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── .env              # Frontend environment variables
└── README.md              # This file
```

## Environment Variables

### Backend (.env)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key

### Frontend (.env)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Twitch API for VOD data
- Supabase for backend services
- FFmpeg for video processing
- React and FastAPI communities 