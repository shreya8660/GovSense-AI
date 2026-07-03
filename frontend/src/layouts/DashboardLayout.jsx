import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  User,
  Users,
  Building2,
  Tag,
  ScrollText,
  BarChart3,
  ClipboardList,
  Settings as SettingsIcon,
  Mic,
} from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../hooks/useAuth';

const NAV_BY_ROLE = {
  citizen: [
    { to: '/citizen/submit-feedback', label: 'Submit Feedback', icon: Mic },
    { to: '/citizen/my-feedback', label: 'My Feedback', icon: FileText },
    { to: '/citizen/profile', label: 'Profile', icon: User },
  ],
  officer: [
    { to: '/officer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/officer/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/officers', label: 'Manage Officers', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/policies', label: 'Policies', icon: ScrollText },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/logs', label: 'Activity Logs', icon: ClipboardList },
    { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ],
};

export default function DashboardLayout() {
  const { role } = useAuth();
  const links = NAV_BY_ROLE[role] || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 py-6 px-3 gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
