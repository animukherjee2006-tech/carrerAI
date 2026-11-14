import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sun, Moon, Menu, Bell, Check, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../Api/notification.api';

export default function Header({ onMenuClick, isDarkMode, onToggleTheme, user }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            if (data.success) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (e) {
            // Silently handle if unauthenticated on landing
        }
    };

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#070714]/85 border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
                
                {/* Left Side: Mobile Menu Button & Brand */}
                <div className="flex items-center space-x-3">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-md shadow-pink-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Career<span className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">AI</span>
                        </span>
                    </Link>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center space-x-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={onToggleTheme}
                        aria-label="Toggle Theme"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-pink-600" />}
                    </button>

                    {/* Authenticated User Controls */}
                    {user ? (
                        <>
                            {/* Notification Bell Dropdown */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 relative transition cursor-pointer"
                                    aria-label="Notifications"
                                >
                                    <Bell className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-200">
                                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                                            <h4 className="font-bold text-sm">Notifications</h4>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-indigo-500 hover:underline flex items-center space-x-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    <span>Mark all read</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                                            {notifications.length === 0 ? (
                                                <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => {
                                                            if (!n.isRead) handleMarkRead(n._id);
                                                            if (n.link) {
                                                                navigate(n.link);
                                                                setNotifOpen(false);
                                                            }
                                                        }}
                                                        className={`p-3 text-xs cursor-pointer rounded-xl transition ${
                                                            n.isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-900/50' : 'bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                                                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile avatar chip */}
                            <Link to="/profile" className="flex items-center space-x-2 pl-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden border border-slate-300 dark:border-slate-700">
                                    {user.profileimage ? (
                                        <img src={user.profileimage} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name ? user.name[0].toUpperCase() : <UserCircle className="w-5 h-5" />
                                    )}
                                </div>
                            </Link>
                        </>
                    ) : (
                        /* Unauthenticated Actions */
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/login"
                                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-pink-600 px-3 py-2 rounded-xl transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 transition active:scale-95"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
