import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import BookingWizard from './pages/BookingWizard';
import WellnessCircle from './pages/WellnessCircle';
import Sisterhood from './pages/Sisterhood';
import Discover from './pages/Discover';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';

function AuthenticatedLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-petal">
      <Navbar />
      <div className="flex-1 flex flex-col items-stretch [&>div]:flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} />
          
          <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/booking" element={<BookingWizard />} />
            <Route path="/wellness" element={<WellnessCircle />} />
            <Route path="/sisterhood" element={<Sisterhood />} />
            <Route path="/discover" element={<Discover />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
