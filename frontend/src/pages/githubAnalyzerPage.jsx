import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    GitBranch,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Award,
    Code,
    Search
} from 'lucide-react';
import { analyzeGithub } from '../Api/career.api';

export default function GithubAnalyzerPage() {
    const { user } = useOutletContext() || {};
    const [username, setUsername] = useState(user?.githubUsername || '');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.githubUsername) {
            handleAnalyze(user.githubUsername);
        }
    }, [user?.githubUsername]);

    const handleAnalyze = async (gitUser) => {
        const u = gitUser || username;
        if (!u.trim()) return;

        try {
            setLoading(true);
            const res = await analyzeGithub(u.trim());
            if (res.success) {
                setAnalysis(res.data);
            }
        } catch (err) {
            console.error('Github analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                    <GitBranch className="w-8 h-8 text-indigo-500" />
                    <span>GitHub & Portfolio Evaluator</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Audit your GitHub repositories, documentation quality, and commit discipline for technical recruiter appeal.
                </p>
            </div>

            {/* Username Search Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAnalyze();
                    }}
                    className="flex flex-col sm:flex-row gap-3 max-w-xl"
                >
                    <div className="flex-1 relative">
                        <GitBranch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter GitHub handle (e.g. torvalds, gaearon)..."
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        <Search className="w-4 h-4" />
                        <span>{loading ? 'Auditing Repos...' : 'Analyze GitHub'}</span>
                    </button>
                </form>
            </div>

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* Top Score Banner */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Portfolio Audit</span>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                @{analysis.username}
                            </h2>
                            <p className="text-xs text-slate-500">Evaluated on architecture depth, documentation clarity, and repository hygiene.</p>
                        </div>

                        <div className="text-right shrink-0">
                            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {analysis.profileScore}/100
                            </span>
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Portfolio Score</span>
                        </div>
                    </div>

                    {/* Strengths & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Portfolio Strengths</span>
                            </h3>

                            <div className="space-y-2.5">
                                {(analysis.strengths || []).map((s, idx) => (
                                    <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                                        ✓ {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span>Optimization Recommendations</span>
                            </h3>

                            <div className="space-y-2.5">
                                {(analysis.recommendations || []).map((r, idx) => (
                                    <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 font-medium">
                                        ⚡ {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Suggested Portfolio Projects */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-pink-500" />
                            <span>Suggested High-Impact Projects to Build</span>
                        </h3>
                        <p className="text-xs text-slate-500">Stand out to hiring managers by adding these projects to your GitHub:</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {(analysis.suggestedPortfolioProjects || [
                                "High-Throughput Real-Time Dashboard with WebSockets and Redis",
                                "Role-Based Access Control (RBAC) Microservice with JWT and Docker"
                            ]).map((proj, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                                    <Code className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{proj}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
