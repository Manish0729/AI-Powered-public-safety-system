import React from 'react';
import { Shield, LayoutDashboard, Cctv, Activity, Settings, Bell } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="font-bold text-lg tracking-wider">SECURE<span className="text-blue-500">AI</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Cctv />} 
            label="Live Feed" 
            isActive={activeTab === 'live-feed'} 
            onClick={() => setActiveTab('live-feed')}
          />
          <NavItem 
            icon={<Activity />} 
            label="Incident Logs" 
            isActive={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')}
          />
          <NavItem 
            icon={<Settings />} 
            label="Settings" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute top-1 left-1"></div>
              <div className="w-4 h-4 rounded-full bg-green-500/20"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">SYSTEM ONLINE</p>
              <p className="text-[10px] text-slate-500">Latency: 24ms</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#020617]">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-md z-10 sticky top-0">
          <h2 className="font-semibold text-slate-200 tracking-wide uppercase text-sm">
            {activeTab.replace('-', ' ')} VIEW
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 relative hover:bg-slate-800 rounded-full transition group">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 text-sm">
              M
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {React.cloneElement(icon, { size: 20, className: isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors' })}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}