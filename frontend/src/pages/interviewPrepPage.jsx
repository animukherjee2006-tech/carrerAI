import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    MessageSquareCode,
    Sparkles,
    Play,
    Clock,
    ArrowRight,
    History,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';
import {
    startInterview,
    submitInterviewAnswer,
    getInterviewHistory,
    getInterviewDetails
} from '../Api/interview.api';

export default function InterviewPrepPage() {
    const { user } = useOutletContext() || {};
    const [viewMode, setViewMode] = useState('setup'); // 'setup', 'active', 'history'
    
    // Setup state
    const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
    const [interviewType, setInterviewType] = useState('Technical');
    const [questionCount, setQuestionCount] = useState(5);
    const [starting, setStarting] = useState(false);

    // Active session state
    const [currentInterview, setCurrentInterview] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answerInput, setAnswerInput] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [currentEvaluation, setCurrentEvaluation] = useState(null);
    const [showModelAnswer, setShowModelAnswer] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);

    // History state
    const [historyList, setHistoryList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Timer effect during active interview
    useEffect(() => {
        let interval = null;
        if (viewMode === 'active' && !currentEvaluation) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [viewMode, currentEvaluation]);

    const formatTimer = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();
        try {
            setStarting(true);
            const res = await startInterview({
                targetRole,
                interviewType,
                count: questionCount
            });

            if (res.success && res.interview) {
                setCurrentInterview(res.interview);
                setCurrentIndex(0);
                setAnswerInput('');
                setCurrentEvaluation(null);
                setTimerSeconds(0);
                setViewMode('active');
            }
        } catch (err) {
            console.error('Start interview error:', err);
        } finally {
            setStarting(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!answerInput.trim() || evaluating) return;

        try {
            setEvaluating(true);
            const res = await submitInterviewAnswer(
                currentInterview._id,
                currentIndex,
                answerInput
            );

            if (res.success) {
                setCurrentEvaluation(res.evaluation);
                setCurrentInterview(res.interview);
            }
        } catch (err) {
            console.error('Answer evaluation error:', err);
        } finally {
            setEvaluating(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < currentInterview.questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setAnswerInput('');
            setCurrentEvaluation(null);
            setShowModelAnswer(false);
            setTimerSeconds(0);
        } else {
            // Completed all questions
            loadHistory();
            setViewMode('history');
        }
    };

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await getInterviewHistory();
            if (res.success) {
                setHistoryList(res.interviews || []);
            }
        } catch (e) {
            console.error('History load error:', e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleViewPastInterview = async (id) => {
        try {
            const res = await getInterviewDetails(id);
            if (res.success) {
                setCurrentInterview(res.interview);
                setCurrentIndex(0);
                const firstQ = res.interview.questions[0];
                if (firstQ?.answer) {
                    setCurrentEvaluation({
                        score: firstQ.score,
                        strengths: firstQ.strengths,
                        weaknesses: firstQ.weaknesses,
                        rubric: firstQ.rubric,
                        modelAnswer: firstQ.modelAnswer
                    });
                }
                setViewMode('active');
            }
        } catch (e) {
            console.error('Load past interview error:', e);
        }
    };

    const currentQuestion = currentInterview?.questions?.[currentIndex];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
                        <MessageSquareCode className="w-8 h-8 text-pink-500" />
                        <span>AI Mock Interview Simulator</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Realistic technical, behavioral, and HR interview rounds with instant rubric evaluation and model answers.
                    </p>
                </div>

                <div className="flex bg-slate-200 dark:bg-slate-800/80 p-1 rounded-2xl self-start">
                    <button
                        onClick={() => setViewMode('setup')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            viewMode === 'setup' || viewMode === 'active'
                                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        New Interview
                    </button>
                    <button
                        onClick={() => {
                            loadHistory();
                            setViewMode('history');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            viewMode === 'history'
                                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Interview History
                    </button>
                </div>
            </div>

            {/* 1. SETUP VIEW */}
            {viewMode === 'setup' && (
                <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure Your Interview Session</h2>
                        <p className="text-xs text-slate-500">Customize the focus and depth according to your upcoming interviews</p>
                    </div>

                    <form onSubmit={handleStartInterview} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Target Job Role</label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Full Stack Developer, DevOps Engineer"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Interview Track</label>
                                <select
                                    value={interviewType}
                                    onChange={(e) => setInterviewType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                                >
                                    <option value="Technical">Technical & Coding</option>
                                    <option value="System Design">System Architecture</option>
                                    <option value="Behavioral">Behavioral (STAR Method)</option>
                                    <option value="HR">HR & Culture Fit</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Questions Count</label>
                                <select
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                                >
                                    <option value={3}>3 Questions (Quick Sprint)</option>
                                    <option value={5}>5 Questions (Standard Round)</option>
                                    <option value={10}>10 Questions (Full Simulation)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={starting}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:from-amber-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{starting ? 'Generating AI Questions...' : 'Start AI Interview Simulation'}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* 2. ACTIVE INTERVIEW SESSION */}
            {viewMode === 'active' && currentQuestion && (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Top Progress & Timer */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <span className="text-xs font-bold text-slate-400">Question</span>
                            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                                {currentIndex + 1} / {currentInterview.questions.length}
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                                <Clock className="w-3.5 h-3.5 text-pink-500" />
                                <span>{formatTimer(timerSeconds)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                                {currentQuestion.category || currentInterview.interviewType}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                                Difficulty: {currentQuestion.difficulty || 'Medium'}
                            </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                            {currentQuestion.question}
                        </h2>

                        {currentQuestion.hint && (
                            <p className="text-xs text-slate-500 italic">
                                💡 Tip: {currentQuestion.hint}
                            </p>
                        )}
                    </div>

                    {/* Answer Input Area (if not evaluated yet) */}
                    {!currentEvaluation ? (
                        <form onSubmit={handleSubmitAnswer} className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Answer</label>
                                <span className="text-[11px] text-slate-400 font-mono">
                                    {answerInput.trim().split(/\s+/).filter(Boolean).length} words
                                </span>
                            </div>

                            <textarea
                                value={answerInput}
                                onChange={(e) => setAnswerInput(e.target.value)}
                                rows={6}
                                placeholder="Type your detailed response here. Use concrete metrics and technical trade-offs..."
                                required
                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />

                            <button
                                type="submit"
                                disabled={evaluating || !answerInput.trim()}
                                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>{evaluating ? 'Evaluating with Rubric...' : 'Submit Answer for AI Scoring'}</span>
                            </button>
                        </form>
                    ) : (
                        /* AI Evaluation Card */
                        <div className="p-7 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Evaluation & Rubric Breakdown</h3>
                                    <p className="text-xs text-slate-500">Calibrated against industry hiring criteria</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                        {currentEvaluation.score}/100
                                    </span>
                                </div>
                            </div>

                            {/* Rubric Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Clarity</span>
                                    <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                                        {currentEvaluation.rubric?.clarity || 8}/10
                                    </div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
                                    <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                                        {currentEvaluation.rubric?.technicalAccuracy || 8}/10
                                    </div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Depth</span>
                                    <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                                        {currentEvaluation.rubric?.depth || 7}/10
                                    </div>
                                </div>
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Key Strengths</h4>
                                    <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                                        {(currentEvaluation.strengths || []).map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
                                    <h4 className="font-bold text-rose-800 dark:text-rose-300">Areas for Improvement</h4>
                                    <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                                        {(currentEvaluation.weaknesses || []).map((w, i) => (
                                            <li key={i}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Model Answer Toggle */}
                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                                >
                                    <span>{showModelAnswer ? 'Hide Exemplary Answer' : 'Show Exemplary Senior Model Answer'}</span>
                                    {showModelAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>

                                {showModelAnswer && (
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {currentEvaluation.modelAnswer}
                                    </div>
                                )}
                            </div>

                            {/* Next Question CTA */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
                                >
                                    <span>{currentIndex < currentInterview.questions.length - 1 ? 'Next Question' : 'Complete Interview Round'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3. HISTORY VIEW */}
            {viewMode === 'history' && (
                <div className="space-y-6">
                    {loadingHistory ? (
                        <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
                    ) : historyList.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-3">
                            <History className="w-12 h-12 text-slate-400 mx-auto" />
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">No interview sessions found</h3>
                            <p className="text-xs text-slate-500">Start an interview session above to track your practice history here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {historyList.map(item => (
                                <div
                                    key={item._id}
                                    className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                                {item.interviewType}
                                            </span>
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
                                                {item.targetRole}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {new Date(item.createdAt).toLocaleDateString()} • {item.questions?.length || 0} Questions
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                                {item.overallScore || 0}%
                                            </span>
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Score</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewPastInterview(item._id)}
                                        className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                                    >
                                        Review Session Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
