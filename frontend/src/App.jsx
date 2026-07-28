import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyApplications from './pages/MyApplications';
import PostJob from './pages/PostJob';
import EmployerDashboard from './pages/EmployerDashboard';
import JobApplicants from './pages/JobApplicants';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/applications"
              element={
                <ProtectedRoute role="jobseeker">
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute role="employer">
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/post"
              element={
                <ProtectedRoute role="employer">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/:jobId/applicants"
              element={
                <ProtectedRoute role="employer">
                  <JobApplicants />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="border-t border-border py-8 mt-16">
          <div className="max-w-6xl mx-auto px-6 text-xs text-muted font-mono">
            Waypoint — a demo job portal built with React, Express &amp; JWT auth.
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
