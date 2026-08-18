import React from 'react';
import { GraduationCap, ShieldAlert, LogOut } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="top-header text-white sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl text-white transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'var(--petrol)', boxShadow: '0 6px 16px -6px rgba(14,110,118,0.7)' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="font-display font-semibold text-base tracking-tight">EduRisk AI</span>
            <span
              className="hidden sm:inline-flex items-center ml-2.5 gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(14,110,118,0.22)', color: '#7fd6da', border: '1px solid rgba(127,214,218,0.25)' }}
            >
              <ShieldAlert size={10} /> Secure workspace
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">{user?.full_name || 'Academic Advisor'}</div>
            <div className="text-[10px] text-slate-400 capitalize">{user?.role || 'Faculty'} · {user?.department || 'General'}</div>
          </div>
          <button
            onClick={onLogout}
            className="p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white rounded-xl transition-all duration-150 text-xs flex items-center space-x-1.5"
            title="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
