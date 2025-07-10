import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface Project {
    project_id: string;
    vod_url: string;
    vod_title: string;
    vod_thumbnail: string;
    vod_username?: string;
    status: string;
    clips: string[];
    created_at: string;
}

function fetchProjects(userId: string) {
    return fetch(`http://localhost:8000/projects/${userId}`).then((res) =>
        res.json()
    );
}

export const ProjectList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Always call useQuery, even if user is null
    const {
        data: projects = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['projects', user?.id],
        queryFn: () => (user?.id ? fetchProjects(user.id) : Promise.resolve([])),
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    // Always call useEffect, even if user is null
    useEffect(() => {
        if (location.state?.newProjectId) {
            navigate(location.pathname, { replace: true, state: {} });
            refetch();
        }
    }, [location.state, navigate, location.pathname, refetch]);

    const handleProjectClick = (project: Project) => {
        navigate('/clips', {
            state: { clips: project.clips, project_id: project.project_id },
        });
    };

    const handleDelete = async (projectId: string) => {
        setDeleting(true);
        try {
            await fetch(`http://localhost:8000/projects/${projectId}`, {
                method: 'DELETE',
            });
            queryClient.setQueryData(
                ['projects', user?.id],
                (old: Project[] = []) => old.filter((p) => p.project_id !== projectId)
            );
            setConfirmDeleteId(null);
        } catch (err) {
            alert('Failed to delete project.');
        } finally {
            setDeleting(false);
        }
    };

    // Only return null after all hooks have been called
    if (!user) {
        return null;
    }

    return (
        <div className="px-6 py-4 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-6">
                    <button className="text-sm text-white font-medium cursor-default">
                        All projects ({projects.length})
                    </button>
                    <button className="text-sm text-zinc-500 cursor-default">
                        Saved projects (0)
                    </button>
                </div>
                {/* Refresh button removed as per user request */}
                <div className="flex items-center gap-4">
                    <div className="text-zinc-400 text-sm">0 GB / 100 GB</div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                        <span className="text-zinc-400 text-sm">Auto-save</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                        <span className="text-zinc-400 text-sm">
                            Auto-import
                        </span>
                    </div>
                    <span className="text-zinc-500 text-sm px-2 py-0.5 bg-zinc-800 rounded">
                        Beta
                    </span>
                </div>
            </div>
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-start pt-16">
                    <div className="text-zinc-400">Loading projects...</div>
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-start pt-16">
                    <div className="text-red-400">Failed to load projects.</div>
                </div>
            ) : projects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-start pt-16">
                    <div className="text-zinc-400">No projects found.</div>
                </div>
            ) : (
                <div className="grid grid-cols-6 gap-6">
                    {projects.map((project: Project) => (
                        <div
                            className="cursor-pointer relative"
                            key={project.project_id}
                        >
                            <div
                                className="relative group"
                                onClick={() => handleProjectClick(project)}
                            >
                                <img
                                    src={project.vod_thumbnail}
                                    alt="Project thumbnail"
                                    className="w-full h-36 object-cover rounded-lg"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-3 flex justify-center items-center w-full">
                                    <div className="text-xs text-white truncate flex items-center gap-2">
                                        {project.status === 'In queue' && (
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        )}
                                        {project.status === 'Processing' && (
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin"></div>
                                        )}
                                        {project.status ===
                                            'Failed to generate clips' && (
                                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        )}
                                        {project.status ===
                                            'Expires in 7 days' && (
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        )}
                                        {project.status}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <h3
                                    className="text-sm font-medium text-white truncate"
                                    title={project.vod_title}
                                >
                                    {project.vod_title}
                                </h3>
                                <div className="relative ml-2">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 focus:outline-none"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setPopoverOpenId(popoverOpenId === project.project_id ? null : project.project_id);
                                        }}
                                    >
                                        <Cog6ToothIcon className="w-5 h-5" />
                                    </button>
                                    {/* Popover */}
                                    {popoverOpenId === project.project_id && (
                                        <div
                                            className="absolute z-30 left-0 bottom-8 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg min-w-[140px]"
                                            style={{ minWidth: 140 }}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <button
                                                className="w-full text-left px-4 py-2 text-white text-sm hover:bg-zinc-800 rounded-md"
                                                onClick={() => {
                                                    setPopoverOpenId(null);
                                                    setConfirmDeleteId(project.project_id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500">
                                {project.vod_username || ''}
                            </div>
                            {/* Confirmation Dialog */}
                            {confirmDeleteId === project.project_id && (
                                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90">
                                    <div className="bg-background-dark rounded-xl shadow-xl w-full max-w-md mx-4 p-8 relative border border-zinc-700">
                                        <button
                                            className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            ×
                                        </button>
                                        <div className="text-lg font-semibold text-white mb-6">Delete this project</div>
                                        {/* Title section */}
                                        <div className="mb-2">
                                            <div className="text-md font-semibold text-zinc-400 uppercase mb-1 tracking-wider">Title</div>
                                            <div className="text-white text-sm mb-1">{project.vod_title}</div>
                                            <hr className="my-3 border-zinc-800" />
                                        </div>
                                        {/* Owner section */}
                                        <div className="mb-2">
                                            <div className="text-md font-semibold text-zinc-400 uppercase mb-1 tracking-wider">Owner</div>
                                            <div className="text-white text-sm mb-1">{project.vod_username || ''}</div>
                                            <hr className="my-3 border-zinc-800" />
                                        </div>
                                        {/* Clips section */}
                                        <div className="mb-2">
                                            <div className="text-md font-semibold text-zinc-400 uppercase mb-1 tracking-wider">Clips</div>
                                            <div className="text-white text-sm mb-1">{project.clips.length} clips</div>
                                            <hr className="my-3 border-zinc-800" />
                                        </div>
                                        {/* Description and Delete button row */}
                                        <div className="flex items-center w-full gap-4 mt-6">
                                            <div className="text-zinc-400 text-sm text-left w-[60%]">
                                                Once you delete this project, all its clips and data will be gone forever.
                                            </div>
                                            <div className="w-[40%] flex justify-end">
                                                <button
                                                    className="text-red-500 hover:underline font-semibold text-base disabled:opacity-60"
                                                    disabled={deleting}
                                                    onClick={() => handleDelete(project.project_id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
