import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
  project_id: string;
  vod_url: string;
  vod_title: string;
  vod_thumbnail: string;
  vod_username?: string; // Add username field
  status: string;
  clips: string[];
  created_at: string;
}

export const ProjectList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/projects/${user.id}`)
      .then(res => res.json())
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [user]);

  const handleProjectClick = (project: Project) => {
    navigate('/clips', { state: { clips: project.clips, project_id: project.project_id } });
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-6">
          <button className="text-sm text-white font-medium">All projects ({projects.length})</button>
          <button className="text-sm text-zinc-500">Saved projects (0)</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-zinc-400 text-sm">0 GB / 100 GB</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
            <span className="text-zinc-400 text-sm">Auto-save</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
            <span className="text-zinc-400 text-sm">Auto-import</span>
          </div>
          <span className="text-zinc-500 text-sm px-2 py-0.5 bg-zinc-800 rounded">Beta</span>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap">
        {projects.map((project: Project) => (
          <div className="w-72 cursor-pointer" key={project.project_id} onClick={() => handleProjectClick(project)}>
            <div className="relative group">
              <img src={project.vod_thumbnail} alt="Project thumbnail" className="w-full h-36 object-cover rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 flex items-center justify-between">
                <div className="text-xs text-white truncate">
                  {project.status === 'In queue' ? 'In queue' : 'Expiring in 7 days'}
                </div>
                <div className="text-white text-lg font-bold ml-2">...</div>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-white truncate" title={project.vod_title}>{project.vod_title}</h3>
              <div className="text-xs text-zinc-500 mt-1">{project.vod_username || ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 