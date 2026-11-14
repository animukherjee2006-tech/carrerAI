import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass, Target, BrainCircuit } from 'lucide-react';

export default function HeroSection({ onLoginClick, onRegisterClick }) {
  const navigate = useNavigate();

  const handleRegister = onRegisterClick || (() => navigate('/register'));
  const handleLogin = onLoginClick || (() => navigate('/login'));

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-16 md:pt-24 pb-12 sm:pb-20 bg-gradient-to-b from-amber-50 via-rose-50/50 to-amber-50/30 text-slate-800 transition-colors duration-300">
      
      {/* Background Decorative Sunset Glow Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-3xl h-48 sm:h-80 md:h-96 bg-gradient-to-tr from-amber-300/40 via-pink-400/30 to-rose-400/20 blur-[70px] sm:blur-[110px] md:blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/80 border border-amber-200/80 text-[11px] sm:text-xs font-bold text-amber-900 backdrop-blur-md shadow-sm max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse shrink-0" />
            <span className="truncate">Next-Gen AI Career Advisor</span>
          </div>
        </div>

        {/* Hero Heading & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mt-4 sm:mt-6">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.25] text-slate-900">
            Architect Your Future with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Precision AI Insights
            </span>
          </h1>
          
          <p className="mt-3 sm:mt-5 text-sm sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium px-2 sm:px-0">
            Navigate your professional journey using tailored skill analysis, personalized learning roadmaps, real job matches, and instant ATS resume evaluations engineered for your target career.
          </p>
        </div>

        {/* Action Buttons (Login & Register) */}
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
          <button
            onClick={handleRegister}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:from-amber-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-500/25 border border-white/40 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Register Now Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleLogin}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-white/80 hover:bg-white text-slate-800 font-bold text-sm sm:text-base border border-pink-200/60 backdrop-blur-md shadow-sm transition-all duration-200 active:scale-95 text-center cursor-pointer"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
          
          {/* Card 1 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-amber-200/60 backdrop-blur-md shadow-sm flex items-start space-x-3.5 sm:space-x-4 hover:bg-white/90 transition-all duration-200">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-300/50 shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Dynamic Roadmaps</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 sm:mt-1 leading-normal">
                Step-by-step phased milestones engineered around your target technical role.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-pink-200/60 backdrop-blur-md shadow-sm flex items-start space-x-3.5 sm:space-x-4 hover:bg-white/90 transition-all duration-200">
            <div className="p-2 sm:p-2.5 rounded-xl bg-pink-100 text-pink-700 border border-pink-300/50 shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">ATS Resume Matching</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 sm:mt-1 leading-normal">
                Instant line-by-line scoring against target job descriptions and keyword audits.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-rose-200/60 backdrop-blur-md shadow-sm flex items-start space-x-3.5 sm:space-x-4 sm:col-span-2 lg:col-span-1 hover:bg-white/90 transition-all duration-200">
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-300/50 shrink-0">
              <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Real-time AI Mock Interviews</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 sm:mt-1 leading-normal">
                Interactive simulations with rubric evaluations, model answers, and timers.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
