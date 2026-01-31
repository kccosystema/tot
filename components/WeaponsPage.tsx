
import React, { useState, useMemo } from 'react';
import { WEAPON_DATA } from '../data/weapons';
import { WeaponItem } from '../types';

interface WeaponsPageProps {
  onAdd: (weapon: WeaponItem) => void;
  currentInputIds: Set<string>;
}

const WeaponsPage: React.FC<WeaponsPageProps> = ({ onAdd, currentInputIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<number | 'All'>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof WeaponItem; direction: 'asc' | 'desc' } | null>(null);

  // Extract unique types for filter
  const weaponTypes = useMemo(() => {
    return ['All', ...Array.from(new Set(WEAPON_DATA.map(w => w.type))).sort()];
  }, []);

  const filteredWeapons = useMemo(() => {
    return WEAPON_DATA.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.id.includes(searchTerm);
      const matchesTier = filterTier === 'All' || w.tier === filterTier;
      const matchesType = filterType === 'All' || w.type === filterType;
      
      return matchesSearch && matchesTier && matchesType;
    }).sort((a, b) => {
      if (!sortConfig) return 0;
      
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      // Handle undefined/null (though our data is strict)
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchTerm, filterTier, filterType, sortConfig]);

  const requestSort = (key: keyof WeaponItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof WeaponItem) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Controls */}
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
            placeholder="Search weapons by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select
            className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value === 'All' ? 'All' : Number(e.target.value))}
          >
            <option value="All">All Tiers</option>
            <option value={1}>Tier 1</option>
            <option value={2}>Tier 2</option>
            <option value={3}>Tier 3</option>
            <option value={4}>Tier 4</option>
            <option value={5}>Tier 5</option>
            <option value={6}>Tier 6</option>
          </select>

          <select
            className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 max-w-[150px]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {weaponTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-200 uppercase bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => requestSort('name')}>
                  Name {getSortIndicator('name')}
                </th>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => requestSort('id')}>
                  ID {getSortIndicator('id')}
                </th>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => requestSort('tier')}>
                  Tier {getSortIndicator('tier')}
                </th>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => requestSort('type')}>
                  Type {getSortIndicator('type')}
                </th>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700 text-right" onClick={() => requestSort('damage')}>
                  Dmg {getSortIndicator('damage')}
                </th>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700 text-right" onClick={() => requestSort('penetration')}>
                  AP {getSortIndicator('penetration')}
                </th>
                <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-700 text-right" onClick={() => requestSort('durability')}>
                  Dura {getSortIndicator('durability')}
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWeapons.map((weapon, idx) => {
                const isAdded = currentInputIds.has(weapon.id);
                return (
                  <tr 
                    key={weapon.id} 
                    className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${isAdded ? 'bg-amber-900/10' : idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {weapon.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{weapon.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        weapon.tier === 6 ? 'bg-red-900 text-red-200' :
                        weapon.tier === 5 ? 'bg-orange-900 text-orange-200' :
                        weapon.tier === 4 ? 'bg-purple-900 text-purple-200' :
                        weapon.tier === 3 ? 'bg-blue-900 text-blue-200' :
                        weapon.tier === 2 ? 'bg-green-900 text-green-200' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        T{weapon.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">{weapon.type}</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-500">{weapon.damage}</td>
                    <td className="px-4 py-3 text-right font-mono">{weapon.penetration}</td>
                    <td className="px-4 py-3 text-right font-mono">{weapon.durability === -1 ? '∞' : weapon.durability}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onAdd(weapon)}
                        className={`text-xs px-3 py-1.5 rounded uppercase font-bold tracking-wider transition-all
                          ${isAdded 
                            ? 'bg-transparent text-green-500 border border-green-500/30 cursor-default' 
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg hover:shadow-amber-500/20'
                          }`}
                      >
                        {isAdded ? 'Added' : 'Add'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {filteredWeapons.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 italic">
                    No weapons found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-800 px-4 py-2 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredWeapons.length} weapons</span>
            <span>Use the calculator on the Home page to price these items based on damage.</span>
        </div>
      </div>
    </div>
  );
};

export default WeaponsPage;
