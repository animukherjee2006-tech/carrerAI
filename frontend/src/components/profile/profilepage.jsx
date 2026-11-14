import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../Api/axios';
import { getme } from '../../Api/auth.api';
import { updateProfile, uploadProfileImage } from '../../Api/profile.api';
import {
    UserCircle,
    Briefcase,
    GraduationCap,
    Award,
    Settings,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Save
} from 'lucide-react';

export default function ProfilePage() {
    const { user: contextUser, setUser: setContextUser } = useOutletContext() || {};
    const [activeTab, setActiveTab] = useState('Personal');

    // 1. Personal fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [headline, setHeadline] = useState('');
    const [bio, setBio] = useState('');
    const [targetRole, setTargetRole] = useState('Full Stack Developer');
    const [careerLevel, setCareerLevel] = useState('Fresher');
    const [githubUsername, setGithubUsername] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');

    // 2. Education
    const [education, setEducation] = useState([
        { degree: '', college: '', educationYear: '' }
    ]);

    // 3. Experience
    const [experience, setExperience] = useState([
        { title: '', company: '', duration: '', description: '' }
    ]);

    // 4. Skills
    const [skillsInput, setSkillsInput] = useState('');

    // 5. Preferences
    const [preferences, setPreferences] = useState({
        jobAlerts: true,
        theme: 'dark',
        expectedSalary: '',
        targetLocations: ['Remote']
    });

    // 6. Avatar
    const [profileImagePreview, setProfileImagePreview] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const res = await getme();
            if (res.success && res.user) {
                const u = res.user;
                setName(u.name || '');
                setEmail(u.email || '');
                setHeadline(u.headline || 'Software Engineer | Aspiring Technologist');
                setBio(u.bio || '');
                setTargetRole(u.targetRole || 'Full Stack Developer');
                setCareerLevel(u.careerLevel || 'Fresher');
                setGithubUsername(u.githubUsername || '');
                setPortfolioUrl(u.portfolioUrl || '');
                setLinkedinUrl(u.linkedinUrl || '');
                setProfileImagePreview(u.profileimage || '');
                setSkillsInput((u.skills || []).join(', '));

                if (u.education && u.education.length > 0) {
                    setEducation(u.education);
                }
                if (u.experience && u.experience.length > 0) {
                    setExperience(u.experience);
                }
                if (u.preferences) {
                    setPreferences(prev => ({ ...prev, ...u.preferences }));
                }
            }
        } catch (err) {
            console.error('Failed to load user profile on mount:', err);
        }
    };

    // Education handlers
    const handleAddEducation = () => {
        setEducation([...education, { degree: '', college: '', educationYear: '' }]);
    };

    const handleRemoveEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const handleEducationChange = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    // Experience handlers
    const handleAddExperience = () => {
        setExperience([...experience, { title: '', company: '', duration: '', description: '' }]);
    };

    const handleRemoveExperience = (index) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const handleExperienceChange = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    // Avatar upload
    const handleAvatarUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('profileimage', file);

        try {
            setLoading(true);
            const res = await uploadProfileImage(formData);
            if (res.data?.success) {
                setProfileImagePreview(res.data.profileimage);
                setMessage({ text: 'Profile photo updated successfully!', type: 'success' });
                if (setContextUser) {
                    setContextUser(prev => ({ ...prev, profileimage: res.data.profileimage }));
                }
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to upload photo', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Save all profile data
    const handleSaveProfile = async (e) => {
        e?.preventDefault();
        const skillsArray = skillsInput
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        try {
            setLoading(true);
            setMessage({ text: '', type: '' });

            const payload = {
                name,
                headline,
                bio,
                targetRole,
                careerLevel,
                githubUsername,
                portfolioUrl,
                linkedinUrl,
                skills: skillsArray,
                education: education.filter(e => e.degree && e.college),
                experience: experience.filter(e => e.title && e.company),
                preferences
            };

            const res = await updateProfile(payload);
            if (res.data?.success) {
                setMessage({ text: 'Profile saved successfully!', type: 'success' });
                if (setContextUser && res.data.user) {
                    setContextUser(res.data.user);
                }
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'Personal', icon: UserCircle },
        { id: 'Experience', icon: Briefcase },
        { id: 'Education', icon: GraduationCap },
        { id: 'Skills', icon: Award },
        { id: 'Preferences', icon: Settings }
    ];

    return (
        <div className="space-y-8">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <UserCircle className="w-8 h-8 text-indigo-500" />
                        <span>Profile & Career Preferences</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Manage your professional persona, verified skills, academic background, and job preferences.
                    </p>
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center space-x-2 self-start cursor-pointer"
                >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save All Changes'}</span>
                </button>
            </div>

            {/* Alert Message */}
            {message.text && (
                <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${
                    message.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-3 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.id}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: PERSONAL */}
            {activeTab === 'Personal' && (
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-5 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl overflow-hidden border-2 border-indigo-400">
                            {profileImagePreview ? (
                                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                name ? name[0].toUpperCase() : 'U'
                            )}
                        </div>

                        <div>
                            <label className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer inline-flex items-center space-x-2">
                                <UploadCloud className="w-4 h-4 text-indigo-500" />
                                <span>Change Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleAvatarUpload(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-[11px] text-slate-400 mt-1.5">JPG, PNG, or WEBP up to 5MB</p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email (Account ID)</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Professional Headline</label>
                            <input
                                type="text"
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="e.g. Senior Full-Stack Engineer | React, Node.js, Distributed Cloud"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Job Role</label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Career Experience Level</label>
                            <select
                                value={careerLevel}
                                onChange={(e) => setCareerLevel(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                            >
                                <option value="Student">Student</option>
                                <option value="Fresher">Fresher / Junior (0-2 yrs)</option>
                                <option value="Experienced">Experienced / Senior (3+ yrs)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">GitHub Username</label>
                            <input
                                type="text"
                                value={githubUsername}
                                onChange={(e) => setGithubUsername(e.target.value)}
                                placeholder="e.g. animus"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Portfolio or Website URL</label>
                            <input
                                type="url"
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                placeholder="https://myportfolio.dev"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bio / Summary</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                placeholder="Brief career summary and focus..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: EXPERIENCE */}
            {activeTab === 'Experience' && (
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Work Experience</h3>
                            <p className="text-xs text-slate-500">Add past engineering roles, internships, or freelance experience</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddExperience}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition flex items-center space-x-1.5 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Experience</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {experience.map((exp, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Position #{idx + 1}</span>
                                    {experience.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExperience(idx)}
                                            className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center space-x-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Remove</span>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Job Title (e.g. Frontend Engineer)"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company Name (e.g. Acme Inc)"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Duration (e.g. 2023 - Present)"
                                        value={exp.duration}
                                        onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                    />
                                </div>

                                <textarea
                                    placeholder="Describe your technical contributions, technologies used, and metrics achieved..."
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: EDUCATION */}
            {activeTab === 'Education' && (
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Education & Degrees</h3>
                            <p className="text-xs text-slate-500">Add colleges, universities, and degrees for ATS verification</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddEducation}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition flex items-center space-x-1.5 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Degree</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {education.map((edu, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Degree (e.g. B.S. in Computer Science)"
                                    value={edu.degree}
                                    onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                    className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="College / University"
                                    value={edu.college}
                                    onChange={(e) => handleEducationChange(idx, 'college', e.target.value)}
                                    className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Graduation Year (e.g. 2024)"
                                    value={edu.educationYear}
                                    onChange={(e) => handleEducationChange(idx, 'educationYear', e.target.value)}
                                    className="w-32 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                                {education.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEducation(idx)}
                                        className="text-rose-500 hover:text-rose-600 p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: SKILLS */}
            {activeTab === 'Skills' && (
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Technical & Professional Skills</h3>
                    <p className="text-xs text-slate-500">
                        Enter your skills separated by commas. These are matched directly against live job listings and ATS algorithms.
                    </p>

                    <textarea
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        rows={4}
                        placeholder="React, Node.js, TypeScript, Python, MongoDB, Docker, Git, REST APIs, Tailwind CSS..."
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />

                    <div className="pt-2 flex flex-wrap gap-2">
                        {skillsInput.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                            <span key={skill} className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: PREFERENCES */}
            {activeTab === 'Preferences' && (
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Career & Job Match Preferences</h3>

                    <div className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Salary Expectation</label>
                            <input
                                type="text"
                                value={preferences.expectedSalary || ''}
                                onChange={(e) => setPreferences({ ...preferences, expectedSalary: e.target.value })}
                                placeholder="e.g. $120,000 - $150,000"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Active Job Recommendations</h4>
                                <p className="text-[11px] text-slate-500">Show high-match jobs matching my skill profile on dashboard</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.jobAlerts}
                                onChange={(e) => setPreferences({ ...preferences, jobAlerts: e.target.checked })}
                                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
