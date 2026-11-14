import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../Api/auth.api";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginComponent() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errorMessage) setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await login(formData);
            if (data.success) {
                navigate("/dashboard", { replace: true });
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#070714] text-slate-200 px-4 py-8 relative overflow-hidden">
            {/* Glow background blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl relative z-10 space-y-6">
                
                {/* Brand */}
                <div className="text-center space-y-2">
                    <Link to="/" className="inline-flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-md shadow-pink-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-white">
                            Career<span className="bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">AI</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white pt-2">Welcome Back</h1>
                    <p className="text-xs text-slate-400">Sign in to access your AI career roadmap & ATS analytics</p>
                </div>

                {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400 text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070913] border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-400">Password</label>
                            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070913] border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:from-amber-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 pt-2">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-pink-400 font-bold hover:underline">
                        Create one free
                    </Link>
                </p>

            </div>
        </div>
    );
}