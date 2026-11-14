import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Landing from './pages/landing';
import LoginComponent from './components/authcomponents/login.component';
import RegisterComponent from './components/authcomponents/register.compo';


// Protected routing & layout
import ProtectedRoute from './routes/protectedroute';
import DashboardLayout from './components/layout/DashboardLayout';

// Protected feature pages
import Dashboard from './pages/dashboard';
import ResumeAnalyzerPage from './pages/resumeAnalyzerPage';
import CareerGuidancePage from './pages/careerGuidancePage';
import JobRecommendationsPage from './pages/jobRecommendationsPage';
import InterviewPrepPage from './pages/interviewPrepPage';
import SkillGapPage from './pages/skillGapPage';
import RoadmapPage from './pages/roadmapPage';
import ChatbotPage from './pages/chatbotpage';
import GithubAnalyzerPage from './pages/githubAnalyzerPage';
import ProfilePage from './components/profile/profilepage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Landing & Auth Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/landingpage" element={<Landing />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/register" element={<RegisterComponent />} />


                {/* Protected SaaS Application Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
                        <Route path="/career-guidance" element={<CareerGuidancePage />} />
                        <Route path="/jobs" element={<JobRecommendationsPage />} />
                        <Route path="/interview-prep" element={<InterviewPrepPage />} />
                        <Route path="/skill-gap" element={<SkillGapPage />} />
                        <Route path="/roadmap" element={<RoadmapPage />} />
                        <Route path="/chatwithai" element={<ChatbotPage />} />
                        <Route path="/github-analyzer" element={<GithubAnalyzerPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
