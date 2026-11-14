import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
    Sparkles,
    FileText,
    TrendingUp,
    CheckCircle2,
    Briefcase,
    MessageSquareCode,
    Compass,
    ArrowRight,
    Target,
    Layers,
    Clock,
    Award
} from 'lucide-react';
import { getDashboardOverview } from '../Api/career.api';

export default function Dashboard() {
    const { user } = useOutletContext() || {};
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const res = await getDashboardOverview();
            if (res.success) {
                setData(res.dashboard);
            }
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('Unable to fetch dashboard metrics. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-28 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                    <div className="h-80 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                </div>
            </div>
        );
    }

    const metrics = data?.metrics || {
        careerReadinessScore: 68,
        resumeScore: 72,
        profileCompletion: 80,
        roadmapProgress: 35,
        avgInterviewScore: 75,
        interviewsCount: 2,
        savedJobsCount: 4,
        activeApplicationsCount: 2
    };

    const targetRole = data?.user?.targetRole || user?.targetRole || 'Full Stack Developer';
    const userName = data?.user?.name || user?.name || 'Engineer';

    return (
        <div className="space-y-8">
            {/* Top Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Career Intelligence Overview</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome back, {userName}!
                        </h1>
                        <p className="mt-2 text-indigo-200 text-sm max-w-xl">
                            Targeting <strong className="text-white">{targetRole}</strong>. Here is your current readiness progress, AI optimization recommendations, and verified job matches.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/resume-analyzer"
                            className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-sm shadow-md hover:bg-indigo-50 transition active:scale-95 flex items-center space-x-2"
                        >
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <span>Analyze Resume</span>
                        </Link>
                        <Link
                            to="/interview-prep"
                            className="px-5 py-2.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition active:scale-95 flex items-center space-x-2"
                        >
                            <MessageSquareCode className="w-4 h-4" />
                            <span>Practice Interview</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Career Readiness Score */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Readiness Score</span>
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {metrics.careerReadinessScore}%
                        </span>
                        <span className="text-xs font-semibold text-emerald-500">
                            {metrics.careerReadinessScore >= 75 ? 'Market Ready' : 'Progressing'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 h-full rounded-full transition-all duration-700"
                            style={{ width: `${metrics.careerReadinessScore}%` }}
                        />
                    </div>
                </div>

                {/* 2. Resume ATS Score */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-pink-500/50 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resume ATS Score</span>
                        <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {metrics.resumeScore}%
                        </span>
                        <span className="text-xs font-semibold text-indigo-500">
                            {metrics.resumeScore >= 80 ? 'ATS Optimized' : 'Needs Polish'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${metrics.resumeScore}%` }}
                        />
                    </div>
                </div>

                {/* 3. Profile Completion */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Profile Completion</span>
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {metrics.profileCompletion}%
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                            {metrics.profileCompletion === 100 ? 'All Set' : 'Details Pending'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${metrics.profileCompletion}%` }}
                        />
                    </div>
                </div>

                {/* 4. Active Job Applications */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tracked Applications</span>
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Briefcase className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {metrics.activeApplicationsCount}
                        </span>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            {metrics.savedJobsCount} Saved
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (metrics.activeApplicationsCount + metrics.savedJobsCount) * 15)}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* Split Section: Recommended Jobs & Next Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left (2 cols): Recommended Jobs with Real Matches */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <Target className="w-5 h-5 text-indigo-500" />
                                <span>High-Match Job Recommendations</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Matched algorithmically against your profile skills and target role</p>
                        </div>
                        <Link
                            to="/jobs"
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                            <span>View all jobs</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {(data?.recommendedJobs || []).slice(0, 4).map((job) => (
                            <div key={job._id || job.title} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{job.title}</h3>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                            {job.matchScore || 85}% Match
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {job.company} • {job.location} • <span className="text-slate-700 dark:text-slate-300 font-semibold">{job.salary}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {(job.skillsRequired || []).slice(0, 4).map(skill => (
                                            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    to="/jobs"
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition shrink-0 self-start sm:self-center"
                                >
                                    Details & Apply
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right (1 col): Personalized Suggestions & Quick Roadmap Progress */}
                <div className="space-y-6">
                    {/* Personalized Next-Step Suggestions */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-pink-500" />
                            <span>Actionable Recommendations</span>
                        </h2>

                        <div className="space-y-3">
                            {(data?.suggestions || []).map((sug, i) => (
                                <Link
                                    key={i}
                                    to={sug.action}
                                    className="block p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-400 transition">{sug.title}</h4>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        {sug.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Activity Stream */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span>Recent Activity</span>
                        </h2>

                        <div className="space-y-3 text-xs">
                            {(data?.recentActivity || []).length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No recent activity recorded.</p>
                            ) : (
                                data.recentActivity.map((act, i) => (
                                    <div key={i} className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
