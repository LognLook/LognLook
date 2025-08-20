import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute, PublicRoute } from './components';
import HomePage from './features/logs/pages/HomePage';
import TroubleShootingPage from './features/logs/pages/TroubleListPage';
import SearchPage from './features/logs/pages/SearchPage';
import DashboardLayout from './features/logs/layouts/DashboardLayout';
import { LoginPage, SignUpPage, UserProfilePage, UserProfileSettingsPage } from './features/auth';
import { ProjectSelectionPage } from './features/projects';
import ProjectSettingsPage from './features/projects/components/ProjectSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new-user"
            element={
              <ProtectedRoute>
                <ProjectSelectionPage isNewUser={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-settings"
            element={
              <ProtectedRoute>
                <UserProfileSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes that require project selection */}
          <Route
            path="/home"
            element={
              <ProtectedRoute requireProject={true}>
                <DashboardLayout>
                  {props => <HomePage {...props} />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/troubles"
            element={
              <ProtectedRoute requireProject={true}>
                <DashboardLayout>
                  {props => <TroubleShootingPage userId={1} {...props} />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute requireProject={true}>
                <DashboardLayout>
                  {props => <SearchPage {...props} />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-settings"
            element={
              <ProtectedRoute requireProject={true}>
                <DashboardLayout>
                  {props => <ProjectSettingsPage {...props} />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App; 