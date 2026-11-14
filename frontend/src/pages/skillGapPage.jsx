import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    Network,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Clock,
    Flame,
    FolderKanban,
    Compass
} from 'lucide-react';
import { getSkillGap } from '../Api/career.api';

export default function SkillGapPage() {
    const { user } = useOutletContext() || {};
    const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSkillGap();
    }, [targetRole]);

    const loadSkillGap = async () => {
        try {
            setLoading(true);
            const res = await getSkillGap(targetRole);
            if (res.success) {
                setData(res.skillGap);
            }
        } catch (e) {
            console.error('Skill gap error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <Network className="w-8 h-8 text-indigo-500" />
                        <span>AI Skill Gap Analyzer</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Compare your current skillset directly against target industry job requirements to prioritize your learning curve.
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-500">Target Role:</label>
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none"
                    >
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Software Engineer">Software Engineer</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-44 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                        <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Skills Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Acquired Skills */}
                        <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span>Skills You Have Acquired ({data?.skillsAcquired?.length || 0})</span>
                            </h3>
                            <p className="text-xs text-slate-500">Found on your profile and verified resume</p>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {(data?.skillsAcquired || []).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No skills listed yet. Add skills in your Profile Settings.</p>
                                ) : (
                                    data.skillsAcquired.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                                            ✓ {skill}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Missing Skills with Priority */}
                        <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                <span>High-Priority Gaps to Bridge</span>
                            </h3>
                            <p className="text-xs text-slate-500">Ranked by hiring demand for {targetRole}</p>

                            <div className="space-y-3 pt-2">
                                {(data?.skillsMissing || []).map((item, idx) => (
                                    <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.skill}</h4>
                                            <p className="text-[11px] text-slate-500">{item.difficulty} • ~{item.estimatedHours} hours</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                            item.priority === 'High'
                                                ? 'bg-rose-500 text-white'
                                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                        }`}>
                                            {item.priority} Priority
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Actionable Learning Sequence */}
                    <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-pink-500" />
                            <span>Recommended Learning Sequence</span>
                        </h3>
                        <p className="text-xs text-slate-500">Logical progression to maximize learning retention and portfolio integration</p>

                        <div className="space-y-3 pt-2">
                            {(data?.learningSequence || []).map((step, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center space-x-3.5">
                                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-normal">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Portfolio Projects */}
                    <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                    <FolderKanban className="w-5 h-5 text-amber-500" />
                                    <span>High-Impact Portfolio Projects</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Build these projects to prove mastery of missing technical competencies</p>
                            </div>
                            <Link
                                to="/roadmap"
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                            >
                                <span>Add to Roadmap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {(data?.recommendedProjects || []).map((proj, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{proj.name}</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{proj.description}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {(proj.skills || []).map(s => (
                                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
