import React, { useState, useMemo } from 'react';
import { BASE_ITEMS, BaseItem } from '../data/baseItems';
import { parseInput } from '../utils/converters';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: BaseItem) => void;
  currentInput: string;
}

const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({ isOpen, onClose, onSelect, currentInput }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Identify which items are already in the list
  const addedItemIds = useMemo(() => {
    const items = parseInput(currentInput);
    return new Set(items.map(i => i.id));
  }, [currentInput]);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(BASE_ITEMS.map(item => item.category)));
    return ['All', ...uniqueCats];
  }, []);

  const filteredItems = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return BASE_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(lowerTerm) || item.id.includes(lowerTerm);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Add Base Items
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 space-y-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 placeholder:text-slate-600"
              autoFocus
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors
                  ${selectedCategory === cat 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' 
                    : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700 hover:text-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto p-2 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No items found matching "{searchTerm}" in {selectedCategory}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredItems.map(item => {
                const isAdded = addedItemIds.has(item.id);
                return (
                  <button
                    key={item.id + item.name}
                    onClick={() => onSelect(item)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left group
                      ${isAdded 
                        ? 'bg-amber-900/20 border-amber-500/50 hover:bg-amber-900/30' 
                        : 'bg-transparent hover:bg-slate-800 border-transparent hover:border-slate-700'
                      }`}
                  >
                    <div>
                      <div className={`font-medium transition-colors ${isAdded ? 'text-amber-400' : 'text-slate-300 group-hover:text-amber-400'}`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">
                        {item.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded">
                        {item.id}
                      </span>
                      {isAdded && (
                        <span className="text-amber-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-wider">
           Click an item to add it to your list
        </div>
      </div>
    </div>
  );
};

export default ItemSelectorModal;