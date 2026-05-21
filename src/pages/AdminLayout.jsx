import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Settings,
  Bell,
  Search,
  Trophy
} from 'lucide-react';
import { authService } from '../api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('super40_admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Applications', path: '/admin/applications', icon: Users },
    { name: 'Super 40 Exams', path: '/admin/exams', icon: Trophy },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <span className="font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-blue-950">
                Super 40 Admin
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Portal Suite</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-5 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 mt-4 opacity-50">Management</p>
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive(item.path) 
                  ? 'bg-blue-950 text-white shadow-xl shadow-blue-900/20 translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive(item.path) ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-900'
                }`} />
                <span className={`font-bold text-[14px] tracking-tight ${isActive(item.path) ? 'text-white' : ''}`}>{item.name}</span>
              </div>
              {isActive(item.path) && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>}
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-black text-[12px] uppercase tracking-widest border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-900 transition-all duration-300" />
              <input 
                type="text" 
                placeholder="Search resources, students, or records..." 
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-8 focus:ring-blue-500/5 transition-all duration-500 placeholder:text-slate-300 placeholder:font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-3 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-2xl transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-10 w-[1px] bg-slate-100"></div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 group-hover:text-blue-900 transition-colors leading-none mb-1.5 uppercase tracking-tighter">Super Admin</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">System Controller</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 group-hover:bg-blue-900 transition-all duration-500 transform group-hover:-rotate-3">
                <span className="text-xs font-black tracking-tighter">SA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
