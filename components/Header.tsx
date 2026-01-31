
import React from 'react';
import { User } from 'https://esm.sh/firebase@12.8.0/auth';

type ViewType = 'dashboard' | 'converter' | 'weapons' | 'armor' | 'tools' | 'materials' | 'components' | 'buildings' | 'consumables' | 'stations' | 'decorations' | 'treasure' | 'utility' | 'warpaints';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSaves: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, onOpenSaves, currentView, onNavigate }) => {
  
  const isTraderToolActive = currentView !== 'dashboard';

  return (
    <header className="bg-slate-900 border-b border-slate-700 pt-6 pb-0 px-4 mb-6 shadow-md z-20 relative">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
        
        {/* Top Bar: Logo & User */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-500 tracking-tight flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
              Conan Admin Tools
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Conan Exiles Modding Utility • Serialized RuleData Generator
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* User Controls */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button 
                    onClick={onOpenSaves}
                    className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-amber-400 transition-colors bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 hover:border-amber-500/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    My Saves
                  </button>
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=f59e0b&color=fff`} 
                      alt={user.displayName || "User"} 
                      className="w-8 h-8 rounded-full border border-slate-600"
                    />
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-200">{user.displayName}</span>
                      <button 
                        onClick={onLogout} 
                        className="text-[10px] text-amber-500 hover:text-amber-400 uppercase tracking-widest font-bold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button 
                  onClick={onLogin}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-slate-600 hover:border-slate-500"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign In to Save
                </button>
              )}
            </div>
            
            {/* Metadata */}
            <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                v2.4.0 Ready
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Currency: 11054
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Container */}
        <div className="flex flex-col">
          
          {/* Main Navigation (Primary Level) */}
          <div className="flex space-x-1 border-b border-slate-800">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-6 py-3 text-base font-bold transition-all rounded-t-lg ${
                !isTraderToolActive
                  ? 'bg-slate-800 text-amber-500 border-t-2 border-amber-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('converter')}
              className={`px-6 py-3 text-base font-bold transition-all rounded-t-lg ${
                isTraderToolActive 
                  ? 'bg-slate-800 text-amber-500 border-t-2 border-amber-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              TOT Trader Tool
            </button>
          </div>

          {/* Secondary Navigation (Only visible if Trader Tool is active) */}
          {isTraderToolActive && (
            <div className="bg-slate-800/50 border-b border-slate-700 overflow-x-auto">
              <div className="flex space-x-6 px-4 pt-1">
                {[
                  { id: 'converter', label: 'Converter' },
                  { id: 'weapons', label: 'Weapons' },
                  { id: 'armor', label: 'Armor' },
                  { id: 'tools', label: 'Tools' },
                  { id: 'materials', label: 'Materials' },
                  { id: 'components', label: 'Components' },
                  { id: 'buildings', label: 'Buildings' },
                  { id: 'consumables', label: 'Consumables' },
                  { id: 'stations', label: 'Stations' },
                  { id: 'decorations', label: 'Decorations' },
                  { id: 'treasure', label: 'Treasure' },
                  { id: 'utility', label: 'Utility' },
                  { id: 'warpaints', label: 'Warpaints' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as ViewType)}
                    className={`pb-3 pt-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                      currentView === item.id 
                        ? 'border-amber-500 text-amber-500' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
