import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    Squares2X2Icon,
    DocumentIcon,
    BriefcaseIcon,
    LinkIcon,
    ArrowUpTrayIcon,
    SpeakerWaveIcon,
    BookOpenIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// Placeholder icons for options not in Heroicons
const CalendarIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
);
const ChartBarIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <path d="M3 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m0 0v2a2 2 0 002 2h2a2 2 0 002-2v-2m0 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6" />
    </svg>
);
const UserGroupIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" />
    </svg>
);
const CreditCardIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
    </svg>
);
const QuestionMarkCircleIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 115.82 0c0 1.5-1.5 2.25-2.25 2.25S12 13.5 12 15" />
        <circle cx="12" cy="17" r="1" />
    </svg>
);
const GlobeAltIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
);
const DoorOpenIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <path d="M16 17v1a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h7a2 2 0 012 2v1" />
        <path d="M11 12h9m0 0l-3-3m3 3l-3 3" />
    </svg>
);
const UserIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <path d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const CcIcon = (props: any) => (
    <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 15a3 3 0 110-6m8 6a3 3 0 110-6" />
    </svg>
);

const CollapseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
    </svg>
);

const UserCircleIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
    </svg>
);

const LogoutIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
        />
    </svg>
);



const defaultAvatar = (
    <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
    >
        <circle cx="20" cy="20" r="20" fill="#2D2D2D" />
        <circle cx="20" cy="16" r="7" fill="#6D28D9" />
        <ellipse cx="20" cy="30" rx="11" ry="7" fill="#4B5563" />
    </svg>
);

type AccountDropdownProps = {
    user: any;
    handleLogout: () => void;
};

const AccountDropdown: React.FC<AccountDropdownProps> = ({
    user,
    handleLogout,
}) => (
    <div className="flex flex-col gap-2">
        <button
            className="flex items-center gap-2 text-white text-sm hover:bg-zinc-800 rounded px-2 py-1 mt-auto"
            onClick={handleLogout}
        >
            <div className="flex items-center gap-2">
                <LogoutIcon className="w-4 h-4" />
                <span>Logout</span>
            </div>
        </button>
    </div>
);

const SidebarItem = ({
    icon,
    label,
    isExpanded,
    badge,
    isActive,
    onTooltipShow,
    onTooltipHide,
    isTooltipActive,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    isExpanded: boolean;
    badge?: string;
    isActive?: boolean;
    onTooltipShow: (
        label: string,
        position: { top: number; left: number }
    ) => void;
    onTooltipHide: () => void;
    isTooltipActive: boolean;
    onClick?: () => void;
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (!isExpanded && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            onTooltipShow(label, {
                top: rect.top + rect.height / 2,
                left: rect.right + 8,
            });
        }
    };

    const handleMouseLeave = () => {
        onTooltipHide();
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className={`flex items-center gap-2 px-2 py-2 text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors mb-1 ${
                    !isExpanded ? 'justify-center w-8 h-8' : 'w-full'
                } ${isActive ? 'bg-zinc-800' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
            >
                <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {icon}
                </span>
                {isExpanded && (
                    <span className="text-xs font-medium flex-1 text-left whitespace-nowrap overflow-hidden">
                        {label}
                    </span>
                )}
                {isExpanded && badge && (
                    <span className="ml-2 bg-zinc-700 text-amber-400 text-[9px] px-1 py-0.5 rounded flex-shrink-0">
                        {badge}
                    </span>
                )}
            </button>
        </div>
    );
};

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const username = user?.email?.split('@')[0] || 'Logged out';

    // Tooltip state management
    const [tooltipData, setTooltipData] = useState<{
        label: string;
        position: { top: number; left: number };
    } | null>(null);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Placeholder member count
    const memberCount = 0;

    const handleTooltipShow = (
        label: string,
        position: { top: number; left: number }
    ) => {
        // Clear any existing hide timeout immediately
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        // Always reset visibility to trigger fade-in animation
        setIsTooltipVisible(false);

        setTooltipData({ label, position });
        // Longer delay to ensure the fade-in animation is visible
        setTimeout(() => setIsTooltipVisible(true), 50);
    };

    const handleTooltipHide = () => {
        setIsTooltipVisible(false);
        // Keep tooltip data for a bit longer to allow smooth transitions
        hideTimeoutRef.current = setTimeout(() => {
            setTooltipData(null);
            hideTimeoutRef.current = null;
        }, 200);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/signin?redirectTo=/dashboard'); // Redirect to login page after logout
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className={`
                bg-background-dark text-white flex flex-col h-screen transition-all duration-300 ease-in-out
                ${
                    isExpanded
                        ? 'w-64 border-r border-zinc-800'
                        : 'w-16 border-r border-transparent'
                }
            `}
        >
            <div className="p-2 h-full flex flex-col">
                {/* Collapse/Expand Button */}
                <div
                    className={`flex items-center mb-1 h-8 ${
                        isExpanded ? 'justify-end' : 'justify-start'
                    }`}
                >
                    <div
                        className={`flex items-center justify-center w-8 h-8 text-zinc-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                />
                            </svg>
                        )}
                    </div>
                </div>
                {/* User Info */}
                <div className="mb-2 relative">
                    <div onClick={() => setDropdownOpen((open) => !open)}>
                        <SidebarItem
                            icon={<UserCircleIcon className="w-4 h-4" />}
                            label={username}
                            isExpanded={isExpanded}
                            onTooltipShow={handleTooltipShow}
                            onTooltipHide={handleTooltipHide}
                            isTooltipActive={!!tooltipData}
                        />
                    </div>
                    {dropdownOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute left-0 mt-2 w-64 bg-zinc-900 rounded-lg shadow-lg z-50 p-4"
                            style={{ minWidth: '200px' }}
                        >
                            <AccountDropdown
                                user={user}
                                handleLogout={handleLogout}
                            />
                        </div>
                    )}
                </div>
                <div className="mb-2">
                    <SidebarItem
                        icon={<UsersIcon size={16} />}
                        label="Invite members"
                        isExpanded={isExpanded}
                        onTooltipShow={handleTooltipShow}
                        onTooltipHide={handleTooltipHide}
                        isTooltipActive={!!tooltipData}
                    />
                </div>
                {/* Create section - visible when expanded, invisible spacer when collapsed */}
                {isExpanded ? (
                    <div className="text-xs text-zinc-500 px-3 py-2">
                        Create
                    </div>
                ) : (
                    <div className="h-8"></div> // Invisible spacer to maintain spacing
                )}
                <SidebarItem
                    icon={<HomeIcon size={16} />}
                    label="Home"
                    isExpanded={isExpanded}
                    isActive={location.pathname === '/dashboard'}
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                    isTooltipActive={!!tooltipData}
                    onClick={() => navigate('/dashboard')}
                />
                <SidebarItem
                    icon={<Squares2X2Icon size={16} />}
                    label="Brand template"
                    isExpanded={isExpanded}
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                    isTooltipActive={!!tooltipData}
                />
                <SidebarItem
                    icon={<DocumentIcon size={16} />}
                    label="Asset library"
                    isExpanded={isExpanded}
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                    isTooltipActive={!!tooltipData}
                />
                {/* Post section - visible when expanded, invisible spacer when collapsed */}
                {isExpanded ? (
                    <div className="text-xs text-zinc-500 px-3 py-2">Post</div>
                ) : (
                    <div className="h-8"></div> // Invisible spacer to maintain spacing
                )}
                <SidebarItem
                    icon={<CalendarIcon size={16} />}
                    label="Calendar"
                    isExpanded={isExpanded}
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                    isTooltipActive={!!tooltipData}
                />
                <SidebarItem
                    icon={<ChartBarIcon size={16} />}
                    label="Analytics"
                    isExpanded={isExpanded}
                    badge="New"
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                    isTooltipActive={!!tooltipData}
                />
                <SidebarItem
                    icon={<LinkIcon size={16} />}
                    label="Social accounts"
                    isExpanded={isExpanded}
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                    isTooltipActive={!!tooltipData}
                />
                <div className="mt-auto">
                    <SidebarItem
                        icon={<CreditCardIcon size={16} />}
                        label="Subscription"
                        isExpanded={isExpanded}
                        onTooltipShow={handleTooltipShow}
                        onTooltipHide={handleTooltipHide}
                        isTooltipActive={!!tooltipData}
                    />
                    <SidebarItem
                        icon={<BookOpenIcon size={16} />}
                        label="Learning center"
                        isExpanded={isExpanded}
                        onTooltipShow={handleTooltipShow}
                        onTooltipHide={handleTooltipHide}
                        isTooltipActive={!!tooltipData}
                    />
                    <SidebarItem
                        icon={<QuestionMarkCircleIcon size={16} />}
                        label="Help center"
                        isExpanded={isExpanded}
                        onTooltipShow={handleTooltipShow}
                        onTooltipHide={handleTooltipHide}
                        isTooltipActive={!!tooltipData}
                    />
                </div>
            </div>

            {/* Global Tooltip */}
            {tooltipData && !isExpanded && (
                <div
                    className="fixed z-50 bg-white text-black px-1.5 py-1 rounded-md shadow-lg text-xs font-medium transition-all duration-200 ease-out"
                    style={{
                        top: tooltipData.position.top - 12,
                        left: tooltipData.position.left,
                        transform: isTooltipVisible
                            ? 'translateX(0)'
                            : 'translateX(-10px)',
                        opacity: isTooltipVisible ? 1 : 0,
                    }}
                >
                    {tooltipData.label}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
