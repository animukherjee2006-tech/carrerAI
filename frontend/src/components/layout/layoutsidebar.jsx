import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Compass,
    Briefcase,
    MessageSquareCode,
    Network,
    Milestone,
    BotMessageSquare,
    GitBranch,
    UserCircle,
    LogOut,
    Sun,
    Moon,
    Sparkles,
    X
} from 'lucide-react';
import { logout } from '../../Api/auth.api';

export default function LayoutSidebar({ isOpen, onClose, isDarkMode, onToggleTheme, user }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            navigate('/login');
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Resume Analyzer', path: '/resume-analyzer', icon: FileText, badge: 'ATS' },
        { name: 'AI Career Guidance', path: '/career-guidance', icon: Compass },
        { name: 'Job Recommendations', path: '/jobs', icon: Briefcase },
        { name: 'AI Interview Prep', path: '/interview-prep', icon: MessageSquareCode, badge: 'AI' },
        { name: 'Skill Gap Analyzer', path: '/skill-gap', icon: Network },
        { name: 'Career Roadmap', path: '/roadmap', icon: Milestone },
        { name: 'AI Assistant Chat', path: '/chatwithai', icon: BotMessageSquare },
        { name: 'GitHub & Portfolio', path: '/github-analyzer', icon: GitBranch },
        { name: 'Profile & Settings', path: '/profile', icon: UserCircle }
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090d16] dark:bg-[#070714] border-r border-slate-800 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand Logo Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 border border-white/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold tracking-tight text-white">
                                Career<span className="bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">AI</span>
                            </span>
                            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Pro Career Platform</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
                    <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Platform Modules
                    </p>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose?.()}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    }`
                                }
                            >
                                <div className="flex items-center space-x-3 truncate">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Footer User Info & Theme Toggle */}
                <div className="p-4 border-t border-slate-800/80 bg-[#060810]/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onToggleTheme}
                            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800 transition"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-pink-400" />}
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                    {user && (
                        <div className="flex items-center space-x-3 pt-1">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden border border-white/20">
                                {user.profileimage ? (
                                    <img src={user.profileimage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name ? user.name[0].toUpperCase() : 'U'
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{user.name || 'User'}</p>
                                <p className="text-[11px] text-slate-400 truncate">{user.targetRole || 'Full Stack Developer'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
