import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Toaster } from 'sonner';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { IssueListPage } from './pages/issues/IssueListPage.jsx';
import { CampusMapPage } from './pages/issues/CampusMapPage.jsx';
import { NewIssuePage } from './pages/issues/NewIssuePage.jsx';
import { IssueDetailPage } from './pages/issues/IssueDetailPage.jsx';
import { MyIssuesPage } from './pages/MyIssuesPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

import { AdminDashboardPage } from './pages/admin/DashboardPage.jsx';
import { PriorityQueuePage } from './pages/admin/PriorityQueuePage.jsx';
import { AdminIssuesPage } from './pages/admin/IssuesPage.jsx';
import { MapPage } from './pages/admin/MapPage.jsx';
import { AnalyticsPage } from './pages/admin/AnalyticsPage.jsx';
import { TrendsPage } from './pages/admin/TrendsPage.jsx';
import { AIInsightsPage } from './pages/admin/AIInsightsPage.jsx';
import { SLAPage } from './pages/admin/SLAPage.jsx';
import { DepartmentsPage } from './pages/admin/DepartmentsPage.jsx';
import { UsersPage } from './pages/admin/UsersPage.jsx';
import { AdminSettingsPage } from './pages/admin/SettingsPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/issues" element={<ProtectedRoute><IssueListPage /></ProtectedRoute>} />
            <Route path="/map" element={<CampusMapPage />} />
            <Route path="/issues/new" element={<ProtectedRoute><NewIssuePage /></ProtectedRoute>} />
            <Route path="/issues/:id" element={<ProtectedRoute><IssueDetailPage /></ProtectedRoute>} />
            <Route path="/my-issues" element={<ProtectedRoute><MyIssuesPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="/admin" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><AdminDashboardPage /></RoleRoute>} />
            <Route path="/admin/priority" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><PriorityQueuePage /></RoleRoute>} />
            <Route path="/admin/issues" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><AdminIssuesPage /></RoleRoute>} />
            <Route path="/admin/map" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><MapPage /></RoleRoute>} />
            <Route path="/admin/analytics" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><AnalyticsPage /></RoleRoute>} />
            <Route path="/admin/trends" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><TrendsPage /></RoleRoute>} />
            <Route path="/admin/ai-insights" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><AIInsightsPage /></RoleRoute>} />
            <Route path="/admin/sla" element={<RoleRoute roles={['CAMPUS_ADMIN','DEPARTMENT_ADMIN','SUPER_ADMIN']}><SLAPage /></RoleRoute>} />
            <Route path="/admin/departments" element={<RoleRoute roles={['CAMPUS_ADMIN','SUPER_ADMIN']}><DepartmentsPage /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute roles={['CAMPUS_ADMIN','SUPER_ADMIN']}><UsersPage /></RoleRoute>} />
            <Route path="/admin/settings" element={<RoleRoute roles={['CAMPUS_ADMIN','SUPER_ADMIN']}><AdminSettingsPage /></RoleRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
