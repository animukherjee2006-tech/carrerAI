import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getme } from "../Api/auth.api";
import { Sparkles } from "lucide-react";

export default function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                await getme();
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        verifyUser();
    }, []);

    // Modern Loading Screen
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[#070714] text-white flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    Authenticating CareerAI Session...
                </div>
            </div>
        );
    }

    // Redirect to login if unauthenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
