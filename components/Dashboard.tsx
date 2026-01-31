
import React from 'react';

interface DashboardProps {
  onNavigate: (view: 'converter') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to Conan Admin Tools</h2>
          <p className="text-slate-300 text-lg max-w-2xl mb-6">
            The ultimate utility suite for Conan Exiles modding. Generate RuleData, calculate prices, and manage your server economy with ease.
          </p>
          <button 
            onClick={() => onNavigate('converter')}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2"
          >
            Launch Trader Tool
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* News & Updates */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-bold text-slate-100">Latest Updates</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="bg-green-900/30 text-green-400 text-xs font-bold px-2 py-1 rounded h-fit whitespace-nowrap">v2.4.0</span>
              <div>
                <h4 className="text-slate-200 font-medium text-sm">Navigation Overhaul</h4>
                <p className="text-slate-400 text-xs mt-1">Split navigation into Dashboard and Trader Tools for better accessibility.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-900/30 text-blue-400 text-xs font-bold px-2 py-1 rounded h-fit whitespace-nowrap">v2.3.0</span>
              <div>
                <h4 className="text-slate-200 font-medium text-sm">Warpaints Database</h4>
                <p className="text-slate-400 text-xs mt-1">Added 37 warpaint items to the database with durability tracking.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-purple-900/30 text-purple-400 text-xs font-bold px-2 py-1 rounded h-fit whitespace-nowrap">v2.2.0</span>
              <div>
                <h4 className="text-slate-200 font-medium text-sm">Utility Items</h4>
                <p className="text-slate-400 text-xs mt-1">Added utility items (Kits, Oils, etc) to the database.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-bold text-slate-100">How to Use</h3>
          </div>
          <div className="space-y-4 text-sm text-slate-400">
            <p>
              <strong className="text-slate-200">1. Navigate:</strong> Switch to the <span className="text-amber-500">TOT Trader Tool</span> tab to access the main converter and item databases.
            </p>
            <p>
              <strong className="text-slate-200">2. Select Items:</strong> Browse the specific category databases (Weapons, Armor, etc.) and click "Add" to send items to the converter.
            </p>
            <p>
              <strong className="text-slate-200">3. Configure:</strong> On the Converter page, adjust your pricing settings (Manual or AI-based) and multipliers.
            </p>
            <p>
              <strong className="text-slate-200">4. Generate:</strong> Click "Convert to RuleData" to generate the serialized string for the TOT ! Admin mod.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
