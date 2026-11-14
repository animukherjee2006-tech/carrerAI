import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    Compass,
    Sparkles,
    CheckCircle2,
    Award,
    ArrowRight,
    Milestone,
    Target
} from 'lucide-react';
import { getCareerGuidance } from '../Api/career.api';

export default function CareerGuidancePage() {
    const { user } = useOutletContext() || {};
    const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
    const [careerLevel, setCareerLevel] = useState(user?.careerLevel || 'Fresher');
    const [guidance, setGuidance] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadGuidance = async () => {
        try {
            setLoading(true);
            const res = await getCareerGuidance(targetRole, careerLevel);
            if (res.success) {
                setGuidance(res.guidance);
            }
        } catch (e) {
            console.error('Career guidance fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGuidance();
    }, [targetRole, careerLevel]);

    const rolesList = [
        'Full Stack Developer',
        'Frontend Developer',
        'Backend Developer',
        'DevOps Engineer',
        'Software Engineer',
        'Cloud Solutions Architect'
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <Compass className="w-8 h-8 text-indigo-500" />
                        <span>AI Career Guidance & Growth Paths</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Personalized career trajectories, high-leverage technical competencies, and step-by-step milestones.
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none"
                    >
                        {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <select
                        value={careerLevel}
                        onChange={(e) => setCareerLevel(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none"
                    >
                        <option value="Student">Student</option>
                        <option value="Fresher">Fresher / Junior</option>
                        <option value="Experienced">Experienced / Senior</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />)}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Trajectory Overview Card */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-3">
                            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold border border-white/20">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Strategic Overview for {targetRole} ({careerLevel})</span>
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
                                {guidance?.overview || `Strategic roadmap designed to master ${targetRole} engineering patterns and competitive positioning.`}
                            </h2>
                        </div>
                    </div>

                    {/* Key Competencies Matrix */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            <span>Core Technical Competencies Required</span>
                        </h3>
                        <p className="text-xs text-slate-500">The foundational pillars required to command market authority in this role</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                            {(guidance?.keyCompetencies || ['Full-stack System Design', 'Cloud Architecture', 'Database Optimization', 'Production Observability']).map((comp, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{comp}</h4>
                                        <p className="text-[11px] text-slate-500 mt-1">High-demand industry requirement</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step-by-Step Learning Milestones */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Milestone className="w-5 h-5 text-pink-500" />
                                    <span>Chronological Development Milestones</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Phased milestones organized by increasing complexity and impact</p>
                            </div>

                            <Link
                                to="/roadmap"
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                            >
                                <span>Track on Roadmap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {(guidance?.milestones || [
                                { phase: 'Month 1-2: Core Mastery', focus: 'State management, async execution pipelines, and robust testing.' },
                                { phase: 'Month 3-4: Scale & Infrastructure', focus: 'Microservices architecture, caching layers (Redis), and container deployments.' },
                                { phase: 'Month 5-6: Senior Leadership', focus: 'CI/CD automation, distributed systems, and technical interview simulations.' }
                            ]).map((m, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{m.phase}</span>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.focus}</p>
                                    </div>
                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 self-start sm:self-center">
                                        Phase {idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Certifications */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <span>Recommended Industry Certifications</span>
                        </h3>
                        <p className="text-xs text-slate-500">Credible credentials valued by hiring managers</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {(guidance?.recommendedCertifications || [
                                'AWS Certified Solutions Architect Associate',
                                'Meta Front-End Developer Professional Certificate'
                            ]).map((cert, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-center space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cert}</h4>
                                        <p className="text-[11px] text-slate-500">Industry recognized validation</p>
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
