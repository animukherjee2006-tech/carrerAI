import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Milestone,
    CheckCircle2,
    Circle,
    RotateCcw,
    Download,
    Calendar,
    Award
} from 'lucide-react';
import {
    getRoadmap,
    updateRoadmapGoal,
    regenerateRoadmap
} from '../Api/career.api';

export default function RoadmapPage() {
    const { user } = useOutletContext() || {};
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [timeframe, setTimeframe] = useState(6);

    useEffect(() => {
        loadRoadmap();
    }, []);

    const loadRoadmap = async () => {
        try {
            setLoading(true);
            const res = await getRoadmap();
            if (res.success) {
                setRoadmap(res.roadmap);
                if (res.roadmap.timeframeMonths) {
                    setTimeframe(res.roadmap.timeframeMonths);
                }
            }
        } catch (err) {
            console.error('Roadmap fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleGoal = async (phaseIndex, goalIndex, currentCompleted) => {
        try {
            const res = await updateRoadmapGoal(phaseIndex, goalIndex, !currentCompleted);
            if (res.success) {
                setRoadmap(res.roadmap);
            }
        } catch (err) {
            console.error('Goal update error:', err);
        }
    };

    const handleRegenerate = async () => {
        try {
            setRegenerating(true);
            const res = await regenerateRoadmap(user?.targetRole || 'Full Stack Developer', timeframe);
            if (res.success) {
                setRoadmap(res.roadmap);
            }
        } catch (err) {
            console.error('Regenerate roadmap error:', err);
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownloadReport = () => {
        if (!roadmap) return;
        const reportData = {
            title: `CareerAI Career Growth Report - ${roadmap.targetRole}`,
            generatedFor: user?.name || 'Engineer',
            targetRole: roadmap.targetRole,
            careerLevel: roadmap.careerLevel,
            overallProgress: `${roadmap.overallProgress}%`,
            timeframe: `${roadmap.timeframeMonths} Months`,
            phases: roadmap.phases,
            generatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `career-report-${roadmap.targetRole.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <Milestone className="w-8 h-8 text-pink-500" />
                        <span>Interactive Career Roadmap</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Track your milestones, technical goals, and progress toward senior-level mastery.
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center space-x-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-pink-500" />
                        <span>Export Report</span>
                    </button>

                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                        <RotateCcw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                        <span>{regenerating ? 'Recalculating...' : 'Regenerate'}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                    <div className="h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Overall Progress Banner */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Roadmap Milestone Target</span>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                {roadmap?.targetRole || 'Full Stack Developer'} • {roadmap?.timeframeMonths || 6} Months Plan
                            </h2>
                            <p className="text-xs text-slate-500">
                                Check off completed goals below to dynamically advance your career readiness score.
                            </p>
                        </div>

                        <div className="flex items-center space-x-5 shrink-0">
                            <div className="text-right">
                                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                    {roadmap?.overallProgress || 0}%
                                </span>
                                <span className="block text-[10px] text-slate-400 uppercase font-bold">Goals Completed</span>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                <Award className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Phases & Goals */}
                    <div className="space-y-6">
                        {(roadmap?.phases || []).map((phase, pIdx) => (
                            <div
                                key={pIdx}
                                className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19] border shadow-sm transition space-y-5 ${
                                    phase.completed
                                        ? 'border-emerald-500/50 bg-emerald-50/10'
                                        : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                            phase.completed
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-indigo-600 text-white'
                                        }`}>
                                            {pIdx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{phase.title}</h3>
                                            <span className="text-xs text-slate-500 flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{phase.duration}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {phase.completed && (
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 self-start sm:self-center">
                                            Phase Completed ✓
                                        </span>
                                    )}
                                </div>

                                {/* Goals List */}
                                <div className="space-y-2.5">
                                    {(phase.goals || []).map((goal, gIdx) => (
                                        <div
                                            key={gIdx}
                                            onClick={() => handleToggleGoal(pIdx, gIdx, goal.completed)}
                                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center space-x-3 ${
                                                goal.completed
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                                            }`}
                                        >
                                            {goal.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                                            )}
                                            <span className={`text-xs font-semibold ${goal.completed ? 'line-through opacity-80' : ''}`}>
                                                {goal.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
