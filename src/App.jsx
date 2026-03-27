import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import BookingWizard from './pages/BookingWizard';
import WellnessCircle from './pages/WellnessCircle';
import Directory from './pages/Directory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><BookingWizard /></ProtectedRoute>} />
          <Route path="/wellness" element={<ProtectedRoute><WellnessCircle /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
