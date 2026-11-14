import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import LayoutSidebar from './layoutsidebar';
import Header from './header';
import { getme } from '../../Api/auth.api';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('careerai-theme') !== 'light';
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Load authenticated user profile
        const fetchUserData = async () => {
            try {
                const res = await getme();
                if (res.user) {
                    setUser(res.user);
                }
            } catch (err) {
                console.error("Failed to load user in layout:", err);
            }
        };

        fetchUserData();
    }, [isDarkMode]);

    const toggleTheme = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('careerai-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('careerai-theme', 'light');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070714] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
            {/* Sidebar */}
            <LayoutSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                user={user}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onToggleTheme={toggleTheme}
                    user={user}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet context={{ user, setUser }} />
                </main>
            </div>
        </div>
    );
}
