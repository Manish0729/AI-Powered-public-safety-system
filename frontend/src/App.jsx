import React, { useState, useEffect, useRef } from 'react';
// Ensure AlertsFeed is correctly imported from your components folder
import AlertsFeed from './components/AlertsFeed';
import { 
  Camera, Activity, AlertOctagon, Wifi, 
  Volume2, VolumeX, Shield, FileText, Maximize, Bell, 
  LogOut, User, ChevronDown, Lock, Mail, BadgeCheck, Clock, Power, 
  Eye, EyeOff, Server, HardDrive, Radio, Crosshair, Grid, Sun, Moon, Zap, Cpu, Info, X, CheckCircle
} from 'lucide-react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Custom CSS for cleaner scrollbar in logs
const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.5); 
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.8); 
  }
`;

const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
let socket;

export default function App() {
  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState([]); 
  const [notifications, setNotifications] = useState([]); 
  
  // Settings States
  const [soundEnabled, setSoundEnabled] = useState(true); 
  const [aiActive, setAiActive] = useState(true); 
  const [camFilter, setCamFilter] = useState('normal');

  const [stats, setStats] = useState({ cameras: 1, critical: 0, fps: 60 });
  const [time, setTime] = useState(new Date());
  
  // Popups
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); 
  const [showServicesModal, setShowServicesModal] = useState(false); // NEW: Services Modal State

  // Login Inputs
  const [email, setEmail] = useState('admin@secure.ai');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const soundRef = useRef(soundEnabled);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SOCKET CONNECTION
  useEffect(() => {
    if (!isLoggedIn) return;

    socket = io(API_URL);
    
    socket.on('new_alert', (newAlert) => {
      if (soundRef.current) {
        try {
          const audio = new Audio(ALERT_SOUND);
          audio.play().catch(e => {});
        } catch (e) {}
      }
      // Limit alerts to last 100 to prevent memory issues over time
      setAlerts((prev) => [newAlert, ...prev].slice(0, 100));
      setNotifications((prev) => [newAlert, ...prev].slice(0, 10));
      setStats(prev => ({ ...prev, critical: prev.critical + 1 }));
    });

    return () => socket.disconnect();
  }, [isLoggedIn]);

  const toggleAiSystem = () => {
    const newState = !aiActive;
    setAiActive(newState);
    if(socket) socket.emit('toggle_ai', newState);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simplified login for demo
    if(email && password) {
        setIsLoggedIn(true);
        setLoginError('');
    } else {
        setLoginError('Please enter credentials.');
    }
  };

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'COMMAND CENTER';
      case 'live-feed': return 'SURVEILLANCE DECK';
      case 'logs': return 'INCIDENT LOGS';
      case 'settings': return 'SYSTEM CONFIG';
      default: return 'SECURE AI';
    }
  };

  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-[#02040a] flex items-center justify-center relative z-50 overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#02040a] to-black"></div>
        <div className="absolute inset-0 bg-[url('https://assets.website-files.com/5f6bc60e665f54545a1e52a5/61435870a6770531d08da217_grid-hero.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-20"></div>
        
        <div className="z-10 bg-[#0a0f1d]/80 backdrop-blur-xl p-10 rounded-3xl w-full max-w-md border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <div className="text-center mb-10">
             <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-2xl mb-4 border border-cyan-500/30 shadow-inner">
                <Shield className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
             </div>
             <h1 className="text-4xl font-black text-white tracking-tight">SECURE<span className="text-cyan-500">.AI</span></h1>
             <p className="text-cyan-400/70 text-xs font-mono mt-3 tracking-[0.3em] uppercase">Quantum Defense Protocol</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase ml-1">Operator Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 transition group-focus-within:text-cyan-400" />
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-800 rounded-xl py-3.5 pl-12 text-sm text-white focus:border-cyan-500/50 focus:bg-[#070b15] focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] outline-none transition-all font-mono" placeholder="Enter ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase ml-1">Secure Passcode</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 transition group-focus-within:text-cyan-400" />
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-800 rounded-xl py-3.5 pl-12 text-sm text-white focus:border-cyan-500/50 focus:bg-[#070b15] focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] outline-none transition-all font-mono" placeholder="admin123(put this password here)"
                />
              </div>
            </div>

            {loginError && <p className="text-red-400 text-xs text-center font-bold border border-red-500/20 bg-red-500/5 py-2 rounded-lg animate-pulse">{loginError}</p>}

            <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] mt-4 text-sm tracking-widest flex items-center justify-center gap-3 uppercase relative overflow-hidden group">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <Power size={18} /> Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP LAYOUT ---
  return (
    <div className="flex h-screen bg-[#02040a] text-slate-100 overflow-hidden font-sans relative selection:bg-cyan-500/30">
      <style>{scrollbarStyle}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#02040a] to-black -z-20"></div>
      <div className="absolute inset-0 bg-[url('https://assets.website-files.com/5f6bc60e665f54545a1e52a5/61435870a6770531d08da217_grid-hero.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-10 -z-10 pointer-events-none"></div>

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0a0f1d]/80 backdrop-blur-md border-r border-white/5 z-30 flex flex-col m-4 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
               <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#02040a] rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-wide text-white leading-none">SECURE<span className="text-cyan-500">.AI</span></h1>
            <p className="text-[10px] text-cyan-400/70 tracking-[0.2em] font-mono mt-1.5 font-bold">PRO V.4.1.2</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3 mt-2">Main Operations</p>
          <NavBtn icon={<Activity />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavBtn icon={<Maximize />} label="Surveillance" active={activeTab === 'live-feed'} onClick={() => setActiveTab('live-feed')} />
          <NavBtn icon={<FileText />} label="Incident Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <div className="my-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4"></div>
          <p className="px-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3">Administration</p>
          <NavBtn icon={<Shield />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 mt-auto">
          <div className={`border p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md transition-all duration-500 ${aiActive ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {aiActive ? <Cpu size={20} /> : <EyeOff size={20} />}
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">{aiActive ? 'NEURAL ENGINE: ACTIVE' : 'NEURAL ENGINE: OFFLINE'}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${aiActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div> Latency: 12ms</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col relative m-4 ml-0 rounded-3xl bg-[#0a0f1d]/60 backdrop-blur-md border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        
        {/* HEADER */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0f1d]/50 backdrop-blur-xl z-20">
          <h2 className="font-mono font-black text-2xl text-white tracking-widest flex items-center gap-3 uppercase drop-shadow-md">
            <span className="text-cyan-500 text-3xl leading-none">/</span> {getHeaderTitle()}
          </h2>
          
          <div className="flex items-center gap-8">
            <div className="text-right hidden lg:block">
              <p className="text-xl font-black text-white leading-none font-mono tracking-tight">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
              <p className="text-[10px] text-cyan-400/80 font-mono tracking-[0.3em] mt-1 font-bold">{time.toDateString().toUpperCase()}</p>
            </div>

            <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>

            <div className="flex gap-4 items-center">
               {/* Notifications */}
               <div className="relative" ref={notificationsRef}>
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 hover:bg-white/5 rounded-2xl transition border border-transparent hover:border-white/10 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                     <Bell className="w-6 h-6 text-slate-300 group-hover:text-white relative z-10 transition" />
                     {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#0a0f1d] rounded-full animate-pulse z-20"></span>}
                  </button>
                  {showNotifications && (
                    <div className="absolute top-14 right-0 w-96 bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-fade-in ring-1 ring-white/5">
                      <div className="p-4 bg-[#0a0f1d] border-b border-white/5 font-black text-xs uppercase tracking-widest text-slate-400 flex justify-between items-center">
                        <span>Recent Alerts</span>
                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md text-[10px]">{notifications.length} New</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {notifications.length === 0 ? <p className="text-center text-slate-500 py-6 text-sm">No recent alerts.</p> :
                          notifications.map((n, i) => (
                             <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-4 items-start relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-2 bg-red-500/20 rounded-lg shrink-0"><AlertOctagon size={18} className="text-red-500"/></div>
                                <div><p className="text-sm font-bold text-white">{n.type}</p><p className="text-[10px] text-slate-500 font-mono mt-1">{n.time} • {n.location}</p></div>
                             </div>
                          ))}
                      </div>
                    </div>
                  )}
               </div>
               
               {/* Profile Dropdown */}
               <div className="relative" ref={profileMenuRef}>
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:bg-white/5 p-2 pr-4 rounded-2xl transition border border-transparent hover:border-white/10 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center font-black text-white text-lg shadow-lg relative z-10 ring-1 ring-white/20">M</div>
                    <div className="hidden md:block text-left relative z-10">
                      <p className="text-sm font-bold text-white leading-none group-hover:text-cyan-400 transition">Manish K.</p>
                      <p className="text-[10px] text-emerald-400 mt-1 font-mono font-bold tracking-wider">LEVEL 5 ADMIN</p>
                    </div>
                    <ChevronDown size={16} className="text-slate-500 group-hover:text-white relative z-10 transition" />
                  </button>
                  
                  {/* DROPDOWN MENU */}
                  {showProfileMenu && (
                    <div className="absolute top-16 right-0 w-64 bg-[#0B1121] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in ring-1 ring-white/5">
                      <div className="p-4 border-b border-white/5">
                          <p className="text-white font-bold">Manish Kumar</p>
                          <p className="text-xs text-slate-400">admin@secure.ai</p>
                      </div>
                      <div className="p-2">
                        <button onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }} className="w-full text-left p-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-sm text-slate-300 transition font-bold"><User size={18} className="text-cyan-400"/> My Profile</button>
                        {/* FIX: Preferences now navigates to Settings */}
                        <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className="w-full text-left p-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-sm text-slate-300 transition font-bold"><Shield size={18} className="text-cyan-400"/> Preferences</button>
                      </div>
                      <div className="p-2 border-t border-white/5">
                        <button onClick={() => setIsLoggedIn(false)} className="w-full text-left p-3 hover:bg-red-500/10 rounded-xl flex items-center gap-3 text-sm text-red-400 transition font-bold"><LogOut size={18} /> Sign Out</button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </header>

        {/* PROFILE MODAL (FIXED CLOSE ICON X) */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040a]/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowProfileModal(false)}>
            <div className="bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)] relative scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              {/* FIXED: Close Button X */}
              <button onClick={() => setShowProfileModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition z-10 font-bold text-lg">✕</button>
              
              <div className="h-40 bg-gradient-to-r from-cyan-900/80 to-blue-900/80 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://assets.website-files.com/5f6bc60e665f54545a1e52a5/61435870a6770531d08da217_grid-hero.svg')] bg-center opacity-30 mix-blend-overlay"></div>
                 <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a0f1d] to-transparent"></div>
              </div>
              
              <div className="px-10 pb-10 text-center relative">
                <div className="relative -mt-20 mb-6 inline-block">
                  <div className="w-36 h-36 rounded-3xl bg-[#0a0f1d] p-2 shadow-2xl ring-1 ring-cyan-500/30 relative z-10">
                     <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-6xl font-black text-white shadow-inner">M</div>
                  </div>
                  <div className="absolute inset-0 bg-cyan-500/30 blur-3xl -z-10 rounded-full opacity-50"></div>
                </div>
                
                <h2 className="text-4xl font-black text-white tracking-tight mb-2">Manish Kumar</h2>
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase">LEVEL 5 SENIOR ADMIN</p>
                </div>

                <div className="grid grid-cols-3 gap-4 my-8">
                  <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 relative group overflow-hidden"><div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 relative z-10">Clearance ID</p><p className="text-white font-black text-lg relative z-10 font-mono">SEC-8829</p></div>
                  <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 relative group overflow-hidden"><div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 relative z-10">Role</p><p className="text-white font-black text-lg relative z-10">COMMANDER</p></div>
                  <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 relative group overflow-hidden"><div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 relative z-10">Status</p><p className="text-emerald-400 font-black text-lg relative z-10">ACTIVE</p></div>
                </div>

                <button onClick={() => setIsLoggedIn(false)} className="w-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 text-sm tracking-widest uppercase group overflow-hidden relative">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <LogOut size={18} className="relative z-10"/> <span className="relative z-10">Terminate Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- SERVICES MODAL (NEW) --- */}
        {showServicesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040a]/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowServicesModal(false)}>
             <div className="bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)] relative p-8" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowServicesModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition font-bold text-lg">✕</button>
                 
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30"><Server className="w-8 h-8 text-cyan-400"/></div>
                    <div>
                        <h2 className="text-3xl font-black text-white">Secure.AI Services</h2>
                        <p className="text-slate-400 text-sm font-mono">Advanced Threat Detection Architecture</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                        <div className="text-cyan-400 mb-2"><Eye size={24}/></div>
                        <h3 className="text-white font-bold mb-1">Real-Time Computer Vision</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">Utilizes YOLOv8 Neural Networks to process 60 FPS video feeds for instant object recognition.</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                        <div className="text-red-400 mb-2"><AlertOctagon size={24}/></div>
                        <h3 className="text-white font-bold mb-1">Weapon Detection</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">Identifies potential threats including knives, scissors, and blunt objects with 99% accuracy.</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                        <div className="text-yellow-400 mb-2"><Activity size={24}/></div>
                        <h3 className="text-white font-bold mb-1">Crowd Analytics</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">Monitors density and detects sudden surges or abnormal gathering patterns in real-time.</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                        <div className="text-emerald-400 mb-2"><Zap size={24}/></div>
                        <h3 className="text-white font-bold mb-1">Instant Response</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">WebSocket integration ensures zero-latency alerts to the command center dashboard.</p>
                    </div>
                 </div>
                 
                 <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle className="text-cyan-400 w-5 h-5 shrink-0"/>
                    <p className="text-cyan-200 text-xs font-mono">System Status: All modules active and running on local server instance.</p>
                 </div>
             </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-hidden relative p-6">
           {/* Pass props to DashboardView */}
           {activeTab === 'dashboard' && <DashboardView stats={stats} aiActive={aiActive} alerts={alerts} />}
           {activeTab === 'live-feed' && <SurveillanceView aiActive={aiActive} filter={camFilter} setFilter={setCamFilter} />}
           {activeTab === 'logs' && <LogsView alerts={alerts} />}
           
           {/* FIX: Pass setShowProfileModal and setShowServicesModal */}
           {activeTab === 'settings' && <SettingsView 
              soundEnabled={soundEnabled} 
              setSoundEnabled={setSoundEnabled} 
              aiActive={aiActive} 
              toggleAiSystem={toggleAiSystem} 
              setShowProfileModal={setShowProfileModal}
              setShowServicesModal={setShowServicesModal} // New Prop for Services Modal
           />}
        </div>
      </main>
    </div>
  );
}

// --- 1. DASHBOARD VIEW ---
function DashboardView({ stats, aiActive, alerts }) {
  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-shrink-0">
        <StatCard title="ACTIVE FEED" value="CAM-01" icon={<Camera className="text-white" />} color="cyan" />
        <StatCard title="THREATS DETECTED" value={stats.critical} icon={<AlertOctagon className="text-white" />} isDanger />
        <StatCard title="PROCESSING" value="60 FPS" icon={<Activity className="text-white" />} color="blue" />
        <StatCard title="NETWORK STATUS" value="STABLE" icon={<Wifi className="text-white" />} color="emerald" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col h-full min-h-0">
           <div className="flex-1 bg-black border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl ring-1 ring-white/5 group">
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                 <span className={`text-white text-[10px] px-3 py-1 rounded-lg font-bold tracking-widest uppercase shadow-lg ${aiActive ? 'bg-red-600 animate-pulse shadow-red-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}>
                    {aiActive ? '● LIVE TARGETING' : '● PASSIVE MONITORING'}
                 </span>
                 {aiActive && <span className="text-cyan-400 text-[10px] font-mono font-bold tracking-[0.2em] animate-pulse">AI LOCK: ENGAGED</span>}
              </div>
              
              <div className="w-full h-full relative flex items-center justify-center bg-[#050505]">
                <img src={`${API_URL}/video_feed`} className="w-full h-full object-contain" alt="Secure Feed Connecting..." />
                <div className="absolute inset-0 pointer-events-none bg-[url('https://assets.website-files.com/5f6bc60e665f54545a1e52a5/61435870a6770531d08da217_grid-hero.svg')] bg-center opacity-10 mix-blend-overlay"></div>
                {aiActive && <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/30 rounded-3xl animate-pulse"></div>}
                <div className="absolute bottom-6 left-6 text-xs text-slate-500 font-mono flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Example Corp. Main Gate Cam
                </div>
                 <div className="absolute bottom-6 right-6 text-xs text-slate-500 font-mono">
                    RES: 4K HDR • LAT: 12ms
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1 flex flex-col h-full min-h-0 gap-6 overflow-hidden">
          <div className="flex-1 bg-[#0a0f1d]/60 backdrop-blur-md border border-white/10 rounded-3xl flex flex-col shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
              <h3 className="font-mono text-xs font-black text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                <FileText size={14} /> Live Incident Log
              </h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative font-mono text-sm">
               <AlertsFeed alerts={alerts} />
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0f1d]/80"></div>
            </div>
          </div>
          
          <div className="h-72 bg-[#0a0f1d]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between shrink-0 relative overflow-hidden font-mono">
             <div className="absolute inset-0 bg-cyan-500/5 opacity-20 mix-blend-overlay pointer-events-none"></div>
             <h3 className="font-black text-xs text-slate-400 tracking-widest uppercase flex items-center gap-2 relative z-10">
                <Server size={14} className="text-cyan-500"/> System Diagnostics
             </h3>
             <div className="space-y-5 relative z-10">
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider"><span>CPU Load (16 Cores)</span><span className="text-blue-400">32%</span></div>
                   <div className="h-2 w-full bg-[#050810] rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 w-[32%] relative"><div className="absolute right-0 top-0 h-full w-1 bg-white/50 animate-pulse"></div></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider"><span>Memory (64GB DDR5)</span><span className="text-purple-400">24%</span></div>
                   <div className="h-2 w-full bg-[#050810] rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 w-[24%] relative"><div className="absolute right-0 top-0 h-full w-1 bg-white/50 animate-pulse"></div></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider"><span>Neural Processing Unit</span><span className="text-emerald-400">OPTIMAL</span></div>
                   <div className="h-2 w-full bg-[#050810] rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 w-[85%] relative animate-pulse"><div className="absolute right-0 top-0 h-full w-1 bg-white/50"></div></div></div>
                </div>
             </div>
             <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1"><HardDrive size={12}/> Storage: 1.2TB Free</span>
                <span className="flex items-center gap-1 text-emerald-500"><Radio size={12}/> Uplink: 10Gbps</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- 2. SURVEILLANCE VIEW ---
function SurveillanceView({ aiActive, filter, setFilter }) {
  const getFilterClass = () => {
    if (filter === 'night') return 'grayscale contrast-125 brightness-150 sepia-[.3] saturate-50';
    if (filter === 'thermal') return 'hue-rotate-180 invert contrast-150 saturate-200 brightness-110';
    return '';
  };

  return (
    <div className="h-full flex gap-6 animate-fade-in">
       <div className="flex-1 flex flex-col bg-black border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl group">
          <div className="absolute top-6 left-6 z-20 flex gap-3">
             <div className="bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-mono text-xs font-bold uppercase flex items-center gap-2 shadow-lg shadow-red-500/20">
               <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span> REC • 00:12:45
             </div>
             {filter !== 'normal' && <div className="bg-cyan-500/20 border border-cyan-500/50 px-3 py-1.5 rounded-lg text-cyan-400 font-mono text-xs font-bold uppercase shadow-lg shadow-cyan-500/10">{filter} MODE ACTIVE</div>}
          </div>
          
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#050505]">
             <img src="http://localhost:8000/video_feed" className={`w-full h-full object-contain transition-all duration-500 ${getFilterClass()}`} alt="Secure Feed" />
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                <div className="w-96 h-96 border-2 border-white/20 rounded-full flex items-center justify-center relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/50"></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/50"></div>
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-white/50"></div>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-white/50"></div>
                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute"></div>
                   <Crosshair size={24} className="text-white/50"/>
                </div>
                <div className="absolute w-full h-[1px] bg-white/10"></div>
                <div className="absolute h-full w-[1px] bg-white/10"></div>
             </div>
          </div>

          <div className="h-20 bg-[#0a0f1d]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-6 px-8 relative z-30">
             <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                <button onClick={() => setFilter('normal')} className={`p-3 rounded-lg border transition-all ${filter==='normal' ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/30' : 'border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`} title="Normal Mode"><Sun size={20}/></button>
                <button onClick={() => setFilter('night')} className={`p-3 rounded-lg border transition-all ${filter==='night' ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/30' : 'border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`} title="Night Vision"><Moon size={20}/></button>
                <button onClick={() => setFilter('thermal')} className={`p-3 rounded-lg border transition-all ${filter==='thermal' ? 'bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/30' : 'border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`} title="Thermal Mode"><Zap size={20}/></button>
             </div>
             <div className="w-[1px] h-10 bg-white/10"></div>
             <button className="p-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition bg-black/40" title="Grid View"><Grid size={20}/></button>
             <button className="p-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition bg-black/40" title="Fullscreen"><Maximize size={20}/></button>
          </div>
       </div>

       <div className="w-72 flex flex-col gap-6">
          <div className="bg-[#0a0f1d]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/5 opacity-20 mix-blend-overlay pointer-events-none"></div>
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 relative z-10 flex items-center gap-2"><Crosshair size={14} className="text-cyan-500"/> PTZ Controls</h3>
             <div className="aspect-square bg-black/40 rounded-full border border-white/10 relative flex items-center justify-center relative z-10 shadow-inner">
                <div className="absolute inset-4 border border-white/5 rounded-full"></div>
                <button className="absolute top-4 p-3 bg-[#0a0f1d] border border-white/10 rounded-full hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition active:scale-90 shadow-lg"><ChevronDown className="rotate-180" size={18}/></button>
                <button className="absolute bottom-4 p-3 bg-[#0a0f1d] border border-white/10 rounded-full hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition active:scale-90 shadow-lg"><ChevronDown size={18}/></button>
                <button className="absolute left-4 p-3 bg-[#0a0f1d] border border-white/10 rounded-full hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition active:scale-90 shadow-lg"><ChevronDown className="rotate-90" size={18}/></button>
                <button className="absolute right-4 p-3 bg-[#0a0f1d] border border-white/10 rounded-full hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition active:scale-90 shadow-lg"><ChevronDown className="-rotate-90" size={18}/></button>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center font-black text-xs text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer hover:scale-105 transition">RESET</div>
             </div>
             <div className="flex gap-3 mt-6 relative z-10">
                <button className="flex-1 bg-[#0a0f1d] border border-white/10 py-3 rounded-xl text-xs font-black hover:bg-white/10 transition uppercase flex items-center justify-center gap-2 hover:border-white/20"><Maximize size={14}/> Zoom In</button>
                <button className="flex-1 bg-[#0a0f1d] border border-white/10 py-3 rounded-xl text-xs font-black hover:bg-white/10 transition uppercase flex items-center justify-center gap-2 hover:border-white/20"><Maximize size={14} className="rotate-180"/> Zoom Out</button>
             </div>
          </div>
          <div className="flex-1 bg-[#0a0f1d]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/5 opacity-20 mix-blend-overlay pointer-events-none"></div>
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 relative z-10 flex items-center gap-2"><Camera size={14} className="text-cyan-500"/> Active Feeds</h3>
             <div className="space-y-3 relative z-10 font-mono">
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex justify-between items-center shadow-[0_0_15px_rgba(6,182,212,0.1)]"><span className="text-xs font-bold text-white flex items-center gap-3"><Camera size={16} className="text-cyan-400"/> CAM-01 (Main)</span><span className="flex items-center gap-2 text-[10px] font-bold text-cyan-400"><span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span> LIVE</span></div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center opacity-60 hover:opacity-100 transition cursor-not-allowed"><span className="text-xs font-bold text-slate-400 flex items-center gap-3"><Camera size={16}/> CAM-02 (Lobby)</span><span className="flex items-center gap-2 text-[10px] font-bold text-red-500"><span className="w-2 h-2 bg-red-500 rounded-full"></span> OFFLINE</span></div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center opacity-60 hover:opacity-100 transition cursor-not-allowed"><span className="text-xs font-bold text-slate-400 flex items-center gap-3"><Camera size={16}/> CAM-03 (Exit)</span><span className="flex items-center gap-2 text-[10px] font-bold text-red-500"><span className="w-2 h-2 bg-red-500 rounded-full"></span> OFFLINE</span></div>
             </div>
          </div>
       </div>
    </div>
  )
}

// --- 3. SETTINGS VIEW (UPDATED) ---
function SettingsView({ soundEnabled, setSoundEnabled, aiActive, toggleAiSystem, setShowProfileModal, setShowServicesModal }) {
  return (
    <div className="max-w-4xl mx-auto mt-8 animate-fade-in">
       <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><Shield className="w-8 h-8 text-cyan-400" /></div><div><h2 className="text-3xl font-bold text-white">System Configuration</h2><p className="text-slate-400 text-sm mt-1">Manage security protocols and neural engine preferences.</p></div></div>
       <div className="grid gap-6">
         {/* General (Audio) */}
         <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all">
            <div className="flex gap-6 items-center"><div className={`p-4 rounded-2xl ${soundEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>{soundEnabled ? <Volume2 size={32} /> : <VolumeX size={32} />}</div><div><h3 className="text-xl font-bold text-white">Audio Alerts</h3><p className="text-slate-400 text-sm mt-1 max-w-md">Emit a high-frequency siren when a threat is detected.</p></div></div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-20 h-10 rounded-full p-1 transition-all duration-300 flex items-center ${soundEnabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-700'}`}><div className={`w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-300 ${soundEnabled ? 'translate-x-10' : 'translate-x-0'}`}></div></button>
         </div>
         
         {/* Profile (Clickable) - FIXED CLICK */}
         <div onClick={() => setShowProfileModal(true)} className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all cursor-pointer group">
            <div className="flex gap-6 items-center"><div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400"><User size={32} /></div><div><h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">Profile & Account</h3><p className="text-slate-400 text-sm mt-1">Manage admin credentials & access.</p></div></div>
            <ChevronDown size={24} className="text-slate-500 -rotate-90 group-hover:text-white transition"/>
         </div>

         {/* Services Info (New) - REPLACES NOTIFICATIONS */}
         <div onClick={() => setShowServicesModal(true)} className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all cursor-pointer group">
            <div className="flex gap-6 items-center"><div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400"><Info size={32} /></div><div><h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">Services</h3><p className="text-slate-400 text-sm mt-1">View SecureAI capabilities and system details.</p></div></div>
            <ChevronDown size={24} className="text-slate-500 -rotate-90 group-hover:text-white transition"/>
         </div>

         {/* AI Toggle */}
         <div className={`glass-panel p-8 rounded-2xl border transition-all ${aiActive ? 'border-emerald-500/30 bg-emerald-900/5' : 'border-red-500/30 bg-red-900/5'} flex items-center justify-between`}>
            <div className="flex gap-6 items-center"><div className={`p-4 rounded-2xl ${aiActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{aiActive ? <Eye size={32} /> : <EyeOff size={32} />}</div><div><h3 className="text-xl font-bold text-white">Neural Engine</h3><p className="text-slate-400 text-sm mt-1">Master switch for detection.</p></div></div>
            <button onClick={toggleAiSystem} className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all duration-300 transform active:scale-95 ${aiActive ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}><Power size={20} /> {aiActive ? 'DEACTIVATE SYSTEM' : 'ACTIVATE SYSTEM'}</button>
         </div>
       </div>
    </div>
  )
}

function LogsView({ alerts }) {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
         <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"><FileText className="w-8 h-8 text-blue-500" /></div>
         <div><h2 className="text-3xl font-black text-white tracking-tight">Intelligence Reports</h2><p className="text-slate-400 text-sm mt-1 font-mono">Comprehensive log of all detected security events.</p></div>
      </div>
      <div className="bg-[#0a0f1d]/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl relative">
        <div className="absolute inset-0 bg-blue-600/5 opacity-20 mix-blend-overlay pointer-events-none"></div>
        <table className="w-full text-left text-sm text-slate-400 relative z-10">
          <thead className="bg-[#0a0f1d]/80 text-slate-200 uppercase font-mono text-xs border-b border-white/10 font-bold tracking-wider"><tr><th className="p-6">Time</th><th className="p-6">Threat Type</th><th className="p-6">Zone / Camera</th><th className="p-6">Status Priority</th></tr></thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {alerts.length === 0 ? <tr><td colSpan="4" className="p-12 text-center text-slate-500 italic">No threats recorded in current session. System secure.</td></tr> : 
              alerts.map((a, i) => (<tr key={i} className="hover:bg-white/5 transition-colors group"><td className="p-6 text-cyan-400 font-bold">{a.time}</td><td className="p-6 font-black text-white group-hover:text-cyan-400 transition uppercase">{a.type}</td><td className="p-6">{a.location}</td><td className="p-6"><span className="text-red-400 bg-red-500/10 px-4 py-1.5 rounded-lg text-xs border border-red-500/20 font-bold tracking-wide uppercase shadow-[0_0_10px_rgba(239,68,68,0.1)]">CRITICAL</span></td></tr>))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NavBtn({ icon, label, active, onClick }) {
  return <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'}`}>
    <div className={`absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'opacity-100' : ''}`}></div>
    <div className="relative z-10 flex items-center gap-4">
      {React.cloneElement(icon, { size: 20, className: active ? 'text-cyan-400 animate-pulse' : 'group-hover:text-cyan-400 transition' })} 
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </div>
  </button>
}

function StatCard({ title, value, icon, isDanger, color = "blue" }) {
  const bgGradient = isDanger ? "from-red-600/20 to-transparent" : `from-${color}-600/20 to-transparent`;
  const textColor = isDanger ? "text-red-500" : `text-${color}-400`;
  const borderColor = isDanger ? "border-red-600/20" : `border-${color}-600/20`;
  const shadowColor = isDanger ? "shadow-red-600/10" : `shadow-${color}-600/10`;
  
  return <div className={`p-6 rounded-3xl border ${borderColor} bg-[#0a0f1d]/60 backdrop-blur-md relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-2xl ${shadowColor}`}>
    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${bgGradient} opacity-30 blur-3xl rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="flex justify-between items-start relative z-10">
        <div>
            <p className="text-slate-400 text-[10px] font-black font-mono tracking-[0.2em] uppercase mb-3">{title}</p>
            <h3 className="text-4xl font-black text-slate-100 font-mono tracking-tight">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${textColor} group-hover:scale-110 transition shadow-lg`}>{icon}</div>
    </div>
  </div>
}