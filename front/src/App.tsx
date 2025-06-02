import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './features/logs/pages/HomePage';
import TroubleShootingPage from './features/logs/pages/TroubleListPage';
import DashboardLayout from './features/logs/layouts/DashboardLayout';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout>
              {props => <HomePage {...props} />}
            </DashboardLayout>
          }
        />
        <Route
          path="/troubles"
          element={
            <DashboardLayout>
              {props => <TroubleShootingPage projectId={1} userId={1} {...props} />}
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App; 