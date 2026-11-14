import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Copy,
    Check,
    Briefcase,
    Sparkles,
    Target,
    Layers,
    RefreshCw,
    Download
} from 'lucide-react';
import { uploadResume } from '../Api/profile.api';
import { getResumeAnalysis, reanalyzeResume, matchResumeWithJob } from '../Api/career.api';

export default function ResumeAnalyzerPage() {
    const { user, setUser } = useOutletContext() || {};
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bullets', 'jobmatch'
    
    // File upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');

    // Resume analysis state
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    // Bullet copy state
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Job match state
    const [jobDescInput, setJobDescInput] = useState('');
    const [jobMatchResult, setJobMatchResult] = useState(null);
    const [matchingJob, setMatchingJob] = useState(false);

    useEffect(() => {
        loadExistingAnalysis();
    }, []);

    const loadExistingAnalysis = async () => {
        try {
            setLoading(true);
            const data = await getResumeAnalysis();
            if (data.success && data.analysis && data.analysis.overallScore) {
                setAnalysis(data.analysis);
            } else if (user?.resumeAnalysis?.overallScore) {
                setAnalysis(user.resumeAnalysis);
            }
        } catch (e) {
            console.error('Failed to load existing resume analysis:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setUploadError('');
            setUploadSuccess('');
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadError('Please select a PDF or DOCX file to analyze.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        try {
            setUploading(true);
            setUploadError('');
            setUploadSuccess('');
            const res = await uploadResume(formData);
            if (res.success) {
                setUploadSuccess('Resume successfully parsed and scored by AI!');
                if (res.data?.analysis) {
                    setAnalysis(res.data.analysis);
                }
                if (setUser) {
                    setUser(prev => ({
                        ...prev,
                        resume: res.data,
                        resumeAnalysis: res.data?.analysis
                    }));
                }
            }
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Resume upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleReanalyze = async () => {
        try {
            setLoading(true);
            const res = await reanalyzeResume({
                targetRole: user?.targetRole || 'Software Engineer',
                careerLevel: user?.careerLevel || 'Fresher'
            });
            if (res.success) {
                setAnalysis(res.analysis);
            }
        } catch (e) {
            console.error('Reanalyze error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleJobMatchSubmit = async (e) => {
        e.preventDefault();
        if (!jobDescInput.trim()) return;

        try {
            setMatchingJob(true);
            const res = await matchResumeWithJob(jobDescInput, user?.targetRole);
            if (res.success) {
                setJobMatchResult(res.data);
            }
        } catch (err) {
            console.error('Job match error:', err);
        } finally {
            setMatchingJob(false);
        }
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-pink-500" />
                        <span>AI Resume & ATS Analyzer</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Upload your PDF or DOCX resume to get instant ATS scoring, keyword audit, and quantified bullet improvements.
                    </p>
                </div>

                {analysis && (
                    <button
                        onClick={handleReanalyze}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center space-x-2 self-start cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Re-run ATS Scan</span>
                    </button>
                )}
            </div>

            {/* Upload Area */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19] border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500/50 transition">
                <form onSubmit={handleUploadSubmit} className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <UploadCloud className="w-8 h-8" />
                    </div>

                    <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {file ? file.name : "Select your Resume file (PDF or DOCX)"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Supports modern single/multi-column PDFs and Microsoft Word (.docx) up to 5MB
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <label className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition">
                            <span>Browse File</span>
                            <input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>

                        {file && (
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:from-amber-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition disabled:opacity-50 cursor-pointer"
                            >
                                {uploading ? 'Parsing & Scoring ATS...' : 'Upload & Analyze Now'}
                            </button>
                        )}
                    </div>

                    {uploadSuccess && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{uploadSuccess}</span>
                        </div>
                    )}

                    {uploadError && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </form>
            </div>

            {/* Analysis Navigation Tabs */}
            <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3.5 relative transition ${
                        activeTab === 'overview'
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                >
                    ATS Score & Audit
                    {activeTab === 'overview' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('bullets')}
                    className={`pb-3.5 relative transition ${
                        activeTab === 'bullets'
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                >
                    Bullet-Point Rewriter (Google XYZ)
                    {activeTab === 'bullets' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('jobmatch')}
                    className={`pb-3.5 relative transition ${
                        activeTab === 'jobmatch'
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                >
                    Job Description Matcher
                    {activeTab === 'jobmatch' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
                    )}
                </button>
            </div>

            {/* TAB 1: OVERVIEW & ATS SCORE */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Scores Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Overall Score */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall ATS Score</span>
                            <div className="my-4 flex items-center justify-between">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    {analysis?.overallScore || 75}%
                                </span>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                    {(analysis?.overallScore || 75) >= 80 ? 'Competitive' : 'Needs Optimization'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysis?.overallScore || 75}%` }} />
                            </div>
                        </div>

                        {/* ATS Compatibility */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Keyword Compatibility</span>
                            <div className="my-4 flex items-center justify-between">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    {analysis?.atsCompatibility || 82}%
                                </span>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                    High Match
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis?.atsCompatibility || 82}%` }} />
                            </div>
                        </div>

                        {/* Impact & Metrics */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Measurable Impact</span>
                            <div className="my-4 flex items-center justify-between">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    {analysis?.impactScore || 68}%
                                </span>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                    Add Metrics
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${analysis?.impactScore || 68}%` }} />
                            </div>
                        </div>

                        {/* Brevity & Format */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Brevity & Formatting</span>
                            <div className="my-4 flex items-center justify-between">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    {analysis?.brevityScore || 85}%
                                </span>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                                    Clean Layout
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-pink-500 h-full rounded-full" style={{ width: `${analysis?.brevityScore || 85}%` }} />
                            </div>
                        </div>

                    </div>

                    {/* AI Executive Summary */}
                    <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Executive ATS Summary</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {analysis?.summary || "Your resume displays solid foundational experience. To reach the top 5% of applicant rankings, quantify outcomes in your previous roles and incorporate missing cloud and distributed architecture keywords."}
                        </p>
                    </div>

                    {/* Skills Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Skills Found */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Verified Skills Detected ({analysis?.skillsFound?.length || 0})</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(analysis?.skillsFound || ['JavaScript', 'React', 'Node.js', 'Git', 'REST APIs', 'MongoDB']).map(skill => (
                                    <span key={skill} className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Missing Skills */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                <span>Missing High-Demand Keywords</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(analysis?.missingSkills || ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design', 'TypeScript']).map(skill => (
                                    <span key={skill} className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                                        + {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section Feedback */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Section-by-Section ATS Evaluation
                        </h3>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(analysis?.sectionFeedback || [
                                { section: 'Work Experience', status: 'Needs Improvement', feedback: 'Add quantified business metrics (e.g. reduced latency by 35%, managed $50k infrastructure).' },
                                { section: 'Skills & Keywords', status: 'Good', feedback: 'Clear technical skills list, ensure grouped logically by Frontend, Backend, Tools.' },
                                { section: 'Education', status: 'Good', feedback: 'Clean degree, college name, and graduation year format.' }
                            ]).map((sec, i) => (
                                <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sec.section}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{sec.feedback}</p>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full self-start sm:self-center shrink-0 ${
                                        sec.status === 'Good'
                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                    }`}>
                                        {sec.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BULLET-POINT REWRITER */}
            {activeTab === 'bullets' && (
                <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                        <strong>Google's Formula for High-Impact Resumes:</strong> Accomplished [X] as measured by [Y], by doing [Z]. Below are AI-rewritten bullet points transforming passive language into quantified achievements.
                    </div>

                    <div className="space-y-4">
                        {(analysis?.bulletImprovements || [
                            {
                                original: "Worked on frontend features with React and styled components",
                                improved: "Architected 14+ reusable React components with responsive Tailwind CSS, reducing front-end bundle size by 24% and accelerating sprint delivery"
                            },
                            {
                                original: "Built REST APIs for user authentication and chat",
                                improved: "Engineered secure RESTful microservices in Node.js/Express with JWT and rate-limiting, processing 10,000+ daily requests with 99.9% uptime"
                            }
                        ]).map((bullet, idx) => (
                            <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original (Passive)</span>
                                    <p className="text-xs text-slate-500 line-through mt-1">{bullet.original}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>AI Enhanced (Action + Metric)</span>
                                        </span>
                                        <button
                                            onClick={() => handleCopy(bullet.improved, idx)}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
                                        >
                                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedIndex === idx ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                        {bullet.improved}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: JOB DESCRIPTION MATCHER */}
            {activeTab === 'jobmatch' && (
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Compare Against Target Job Posting</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Paste the exact job description to see how your resume scores against its required keywords and qualifications.
                            </p>
                        </div>

                        <form onSubmit={handleJobMatchSubmit} className="space-y-4">
                            <textarea
                                value={jobDescInput}
                                onChange={(e) => setJobDescInput(e.target.value)}
                                rows={5}
                                placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />

                            <button
                                type="submit"
                                disabled={matchingJob || !jobDescInput.trim()}
                                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                            >
                                <Target className="w-4 h-4" />
                                <span>{matchingJob ? 'Analyzing Compatibility...' : 'Calculate Job Match Score'}</span>
                            </button>
                        </form>
                    </div>

                    {jobMatchResult && (
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold text-base text-slate-900 dark:text-white">Job Match Results</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{jobMatchResult.recommendation}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                        {jobMatchResult.matchScore}%
                                    </span>
                                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Compatibility</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                                    <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-2">Overlapping Keywords Found</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(jobMatchResult.matchingSkills || []).map(s => (
                                            <span key={s} className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                                    <h5 className="font-bold text-xs text-rose-800 dark:text-rose-300 mb-2">Missing Target Keywords to Add</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(jobMatchResult.missingKeywords || []).map(s => (
                                            <span key={s} className="px-2.5 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                                                + {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
