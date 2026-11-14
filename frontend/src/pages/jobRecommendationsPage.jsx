import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Briefcase,
    Search,
    Filter,
    Bookmark,
    BookmarkCheck,
    ExternalLink,
    Building2,
    MapPin,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Calendar,
    ChevronDown
} from 'lucide-react';
import {
    getJobs,
    getUserApplications,
    trackApplication,
    updateApplicationStatus,
    deleteApplication
} from '../Api/job.api';

export default function JobRecommendationsPage() {
    const { user } = useOutletContext() || {};
    const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' or 'tracker'
    
    // Jobs listing state
    const [jobs, setJobs] = useState([]);
    const [appliedStatuses, setAppliedStatuses] = useState({});
    const [loadingJobs, setLoadingJobs] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');

    // Applications Tracker state
    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    useEffect(() => {
        loadJobs();
    }, [search, locationFilter, typeFilter, levelFilter]);

    useEffect(() => {
        if (activeTab === 'tracker') {
            loadApplications();
        }
    }, [activeTab]);

    const loadJobs = async () => {
        try {
            setLoadingJobs(true);
            const data = await getJobs({
                search,
                location: locationFilter !== 'All' ? locationFilter : undefined,
                type: typeFilter !== 'All' ? typeFilter : undefined,
                experienceLevel: levelFilter !== 'All' ? levelFilter : undefined
            });

            if (data.success) {
                setJobs(data.jobs || []);
                setAppliedStatuses(data.appliedStatuses || {});
            }
        } catch (err) {
            console.error('Failed to load jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    };

    const loadApplications = async () => {
        try {
            setLoadingApps(true);
            const data = await getUserApplications();
            if (data.success) {
                setApplications(data.applications || []);
            }
        } catch (err) {
            console.error('Failed to load applications:', err);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleSaveJob = async (job) => {
        try {
            const currentStatus = appliedStatuses[job._id];
            const newStatus = currentStatus === 'Saved' ? 'Applied' : 'Saved';

            const res = await trackApplication({
                jobId: job._id,
                jobTitle: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary,
                jobUrl: job.applyUrl,
                status: newStatus
            });

            if (res.success) {
                setAppliedStatuses(prev => ({
                    ...prev,
                    [job._id]: newStatus
                }));
            }
        } catch (err) {
            console.error('Save job error:', err);
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            const res = await updateApplicationStatus(appId, newStatus);
            if (res.success) {
                setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
            }
        } catch (e) {
            console.error('Update status error:', e);
        }
    };

    const handleDeleteApp = async (appId) => {
        try {
            await deleteApplication(appId);
            setApplications(prev => prev.filter(a => a._id !== appId));
        } catch (e) {
            console.error('Delete application error:', e);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <Briefcase className="w-8 h-8 text-amber-500" />
                        <span>Job Recommendations & Tracker</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Verified active job openings calibrated against your profile skills with automatic compatibility scoring.
                    </p>
                </div>

                {/* Tabs Switch */}
                <div className="flex bg-slate-200 dark:bg-slate-800/80 p-1 rounded-2xl self-start">
                    <button
                        onClick={() => setActiveTab('recommendations')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeTab === 'recommendations'
                                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Recommended Jobs ({jobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tracker')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeTab === 'tracker'
                                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Application Tracker
                    </button>
                </div>
            </div>

            {/* TAB 1: RECOMMENDED JOBS */}
            {activeTab === 'recommendations' && (
                <div className="space-y-6">
                    {/* Search & Filters Bar */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by job title, company, or technical skill..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                                <option value="All">All Locations</option>
                                <option value="Remote">Remote</option>
                                <option value="San Francisco">San Francisco</option>
                                <option value="New York">New York</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                                <option value="All">All Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>

                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                                <option value="All">All Levels</option>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Mid Level">Mid Level</option>
                                <option value="Senior">Senior</option>
                            </select>
                        </div>
                    </div>

                    {/* Jobs List */}
                    {loadingJobs ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-3">
                            <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">No jobs match your filters</h3>
                            <p className="text-xs text-slate-500">Try clearing or adjusting search filters to see more verified listings.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map(job => {
                                const currentStatus = appliedStatuses[job._id];
                                return (
                                    <div
                                        key={job._id}
                                        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 transition space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                                        {job.title}
                                                    </h3>
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                                        {job.matchScore}% Match
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    <span className="flex items-center space-x-1 font-semibold text-slate-800 dark:text-slate-200">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        <span>{job.company}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span>{job.location}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1 font-semibold text-indigo-600 dark:text-indigo-400">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        <span>{job.salary}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2 self-start shrink-0">
                                                <button
                                                    onClick={() => handleSaveJob(job)}
                                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                                                        currentStatus === 'Saved'
                                                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                                            : currentStatus === 'Applied'
                                                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {currentStatus ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                                    <span>{currentStatus || 'Save Job'}</span>
                                                </button>

                                                <a
                                                    href={job.applyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => {
                                                        if (!currentStatus) handleSaveJob(job);
                                                    }}
                                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
                                                >
                                                    <span>Apply Live</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                                            {job.description}
                                        </p>

                                        {/* Skill Matching Badges */}
                                        <div className="pt-2 flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-400">Skills Required:</span>
                                            {(job.skillsRequired || []).map(skill => {
                                                const isMatched = (job.matchedSkills || []).includes(skill);
                                                return (
                                                    <span
                                                        key={skill}
                                                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                                                            isMatched
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                                                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        {isMatched ? '✓ ' : ''}{skill}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: APPLICATION TRACKER */}
            {activeTab === 'tracker' && (
                <div className="space-y-6">
                    {loadingApps ? (
                        <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-3">
                            <Bookmark className="w-12 h-12 text-slate-400 mx-auto" />
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">No jobs tracked yet</h3>
                            <p className="text-xs text-slate-500">Click "Save Job" on any job in the recommendations tab to track its progress here.</p>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="pb-3">Job Title & Company</th>
                                        <th className="pb-3">Location</th>
                                        <th className="pb-3">Salary</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Date Tracked</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {applications.map(app => (
                                        <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                                            <td className="py-4 font-bold text-slate-900 dark:text-white">
                                                <div>{app.jobTitle}</div>
                                                <div className="text-[11px] font-normal text-slate-500">{app.company}</div>
                                            </td>
                                            <td className="py-4 text-slate-600 dark:text-slate-400">{app.location || 'Remote'}</td>
                                            <td className="py-4 text-slate-600 dark:text-slate-400 font-medium">{app.salary || 'Competitive'}</td>
                                            <td className="py-4">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                                                >
                                                    <option value="Saved">Saved</option>
                                                    <option value="Applied">Applied</option>
                                                    <option value="Interviewing">Interviewing</option>
                                                    <option value="Offered">Offered</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="py-4 text-slate-500">{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteApp(app._id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                                                    title="Remove from tracker"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
