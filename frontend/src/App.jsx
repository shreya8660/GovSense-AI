import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';

import Home from './pages/Home/Home';
import About from './pages/About/About';
import Policies from './pages/Policies/Policies';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/Login/ForgotPassword';
import ResetPassword from './pages/Login/ResetPassword';
import VerifyEmail from './pages/Login/VerifyEmail';

import SubmitFeedback from './pages/Citizen/SubmitFeedback';
import MyFeedback from './pages/Citizen/MyFeedback';
import Profile from './pages/Profile/Profile';

import OfficerDashboard from './pages/Officer/OfficerDashboard';

import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageOfficers from './pages/Admin/ManageOfficers';
import ManageDepartments from './pages/Admin/ManageDepartments';
import ManageCategories from './pages/Admin/ManageCategories';
import ManagePolicies from './pages/Admin/ManagePolicies';
import Analytics from './pages/Admin/Analytics';
import Logs from './pages/Admin/Logs';
import Settings from './pages/Admin/Settings';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
      <p className="text-slate-600 dark:text-slate-400">Page not found.</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* ---- Public routes ---- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>

      {/* ---- Citizen ---- */}
      <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/citizen" element={<Navigate to="/citizen/submit-feedback" replace />} />
          <Route path="/citizen/submit-feedback" element={<SubmitFeedback />} />
          <Route path="/citizen/my-feedback" element={<MyFeedback />} />
          <Route path="/citizen/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ---- Officer ---- */}
      <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/officer/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ---- Admin ---- */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/officers" element={<ManageOfficers />} />
          <Route path="/admin/departments" element={<ManageDepartments />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/policies" element={<ManagePolicies />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/logs" element={<Logs />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
