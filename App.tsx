
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard'; // Import Dashboard
import ItemSelectorModal from './components/ItemSelectorModal';
import SavedBatchesModal from './components/SavedBatchesModal';
import WeaponsPage from './components/WeaponsPage';
import ArmorPage from './components/ArmorPage';
import ToolsPage from './components/ToolsPage';
import MaterialsPage from './components/MaterialsPage';
import ComponentsPage from './components/ComponentsPage';
import BuildingsPage from './components/BuildingsPage';
import ConsumablesPage from './components/ConsumablesPage';
import StationsPage from './components/StationsPage';
import DecorationsPage from './components/DecorationsPage';
import TreasurePage from './components/TreasurePage';
import UtilityPage from './components/UtilityPage';
import WarpaintsPage from './components/WarpaintsPage';
import { parseInput, convertToTOTAdminString, generateBatchTOTAdminString } from './utils/converters';
import { logUsage } from './utils/logger';
import { db, auth, googleProvider } from './utils/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'https://esm.sh/firebase@12.8.0/auth';
import { collection, addDoc } from 'https://esm.sh/firebase@12.8.0/firestore';
import { ConversionResult, ItemData, WeaponItem, ArmorItem, ToolItem, MaterialItem, ComponentItem, BuildingItem, ConsumableItem, StationItem, DecorationItem, TreasureItem, UtilityItem, WarpaintItem } from './types';
import { GoogleGenAI, Type } from "@google/genai";
import { BaseItem } from './data/baseItems';

type ViewType = 'dashboard' | 'converter' | 'weapons' | 'armor' | 'tools' | 'materials' | 'components' | 'buildings' | 'consumables' | 'stations' | 'decorations' | 'treasure' | 'utility' | 'warpaints';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Settings State
  const [useDamagePricing, setUseDamagePricing] = useState(true);
  const [multiplier, setMultiplier] = useState(10);
  
  // AI State
  const [useAiPricing, setUseAiPricing] = useState(false);
  const [grindLevel, setGrindLevel] = useState(5); // 1-10
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavesModalOpen, setIsSavesModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setResults([]); // Clear sensitive data on logout potentially
      setInputText('');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const batchString = useMemo(() => {
    if (results.length === 0) return '';
    return generateBatchTOTAdminString(results);
  }, [results]);

  const currentInputIds = useMemo(() => {
    const items = parseInput(inputText);
    return new Set(items.map(i => i.id));
  }, [inputText]);

  const calculateManualPrice = (item: ItemData): number => {
    return useDamagePricing 
      ? Math.round(item.value * multiplier) 
      : Math.round(item.value);
  };

  const handleConvert = async (overrideInput?: string) => {
    const textToProcess = overrideInput || inputText;
    const parsedItems = parseInput(textToProcess);
    if (parsedItems.length === 0) return;

    let finalResults: ConversionResult[] = [];

    // Manual Calculation Path
    if (!useAiPricing) {
      finalResults = parsedItems.map(item => {
        const price = calculateManualPrice(item);
        return {
          input: item,
          output: convertToTOTAdminString(item, price),
          calculatedPrice: price
        };
      });
      setResults(finalResults);
      logUsage(parsedItems, finalResults, false, { grindLevel, useDamagePricing, multiplier });
      return;
    }

    // AI Calculation Path
    setIsGenerating(true);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are an expert game economist for Conan Exiles. 
        Calculate fair market prices for the following items in "Gold Coins" (ID 11054).
        The user wants a "Grind Level" of ${grindLevel} on a scale of 1 (Casual) to 10 (Hardcore).
        
        CRITICAL: 
        1. You MUST return a JSON object with an "items" array.
        2. Each item object MUST contain the "id" exactly as provided in the input.
        3. Do not modify, trim, or alter the "id" strings.
        4. Provide an integer "price" for each item.
        
        Input Data:
        ${JSON.stringify(parsedItems.map(i => ({ id: i.id, name: i.name, value: i.value })))}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    price: { type: Type.INTEGER }
                  },
                  required: ["id", "price"]
                }
              }
            }
          }
        }
      });

      console.log("AI Response:", response.text);

      const jsonResponse = JSON.parse(response.text || '{"items": []}');
      
      if (!jsonResponse.items || jsonResponse.items.length === 0) {
        throw new Error("AI returned empty result. Please try again.");
      }

      const aiPrices = new Map<string, number>();
      
      jsonResponse.items.forEach((p: {id: string, price: number}) => {
        if (p.id && p.price !== undefined) {
          aiPrices.set(String(p.id).trim(), p.price);
        }
      });

      finalResults = parsedItems.map(item => {
        const aiPrice = aiPrices.get(item.id.trim());
        const price = aiPrice !== undefined ? aiPrice : calculateManualPrice(item);
          
        return {
          input: item,
          output: convertToTOTAdminString(item, price),
          calculatedPrice: price
        };
      });

      setResults(finalResults);
      logUsage(parsedItems, finalResults, true, { grindLevel, useDamagePricing, multiplier });

      const updatedInputText = finalResults.map(r => 
        `${r.input.id}, ${r.input.name}, ${r.calculatedPrice}`
      ).join('\n');
      setInputText(updatedInputText);

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setAiError(err.message || "Failed to generate AI prices.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBatch = async () => {
    if (!user || results.length === 0) return;
    setIsSaving(true);
    try {
      const mainName = results[0].input.name + (results.length > 1 ? ` + ${results.length - 1} others` : '');
      await addDoc(collection(db, 'users', user.uid, 'saved_batches'), {
        timestamp: new Date().toISOString(),
        name: mainName,
        itemCount: results.length,
        inputRaw: inputText,
        results: results.map(r => ({
          id: r.input.id,
          name: r.input.name,
          price: r.calculatedPrice
        }))
      });
      alert('Batch saved successfully!');
    } catch (error) {
      console.error("Error saving batch:", error);
      alert('Failed to save batch.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSavedBatch = (savedInputRaw: string) => {
    setInputText(savedInputRaw);
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
    setAiError(null);
  };

  const handleAddBaseItem = (item: BaseItem) => {
    const lineToAdd = `${item.id}, ${item.name}, 10`;
    setInputText(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${lineToAdd}` : lineToAdd;
    });
  };

  // Helper to create add handlers for specific types
  const createAddHandler = <T extends { id: string; name: string; [key: string]: any }>(
    valueKey: keyof T | null, 
    defaultValue: number = 0
  ) => {
    return (item: T) => {
      const value = valueKey ? (item[valueKey] as number) : defaultValue;
      const lineToAdd = `${item.id}, ${item.name}, ${value || 0}`;
      setInputText(prev => {
        const trimmed = prev.trim();
        if (prev.includes(item.id)) return prev;
        return trimmed ? `${trimmed}\n${lineToAdd}` : lineToAdd;
      });
    };
  };

  const handleAddWeapon = createAddHandler<WeaponItem>('damage');
  const handleAddArmor = createAddHandler<ArmorItem>('armorValue');
  const handleAddTool = createAddHandler<ToolItem>('durability');
  const handleAddMaterial = createAddHandler<MaterialItem>(null);
  const handleAddComponent = createAddHandler<ComponentItem>(null);
  const handleAddBuilding = createAddHandler<BuildingItem>(null);
  const handleAddConsumable = createAddHandler<ConsumableItem>(null);
  const handleAddStation = createAddHandler<StationItem>(null);
  const handleAddDecoration = createAddHandler<DecorationItem>(null);
  const handleAddTreasure = createAddHandler<TreasureItem>(null);
  const handleAddUtility = createAddHandler<UtilityItem>(null);
  const handleAddWarpaint = createAddHandler<WarpaintItem>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAll = () => {
    if (batchString) {
      copyToClipboard(batchString);
      setIsCopiedAll(true);
      setTimeout(() => setIsCopiedAll(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-200 bg-[#0f172a]">
      <Header 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onOpenSaves={() => setIsSavesModalOpen(true)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-4 pb-12">
        
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <Dashboard onNavigate={setCurrentView} />
        )}

        {/* WEAPONS PAGE VIEW */}
        <div className={currentView === 'weapons' ? 'block' : 'hidden'}>
           <WeaponsPage onAdd={handleAddWeapon} currentInputIds={currentInputIds} />
        </div>

        {/* ARMOR PAGE VIEW */}
        <div className={currentView === 'armor' ? 'block' : 'hidden'}>
           <ArmorPage onAdd={handleAddArmor} currentInputIds={currentInputIds} />
        </div>

        {/* TOOLS PAGE VIEW */}
        <div className={currentView === 'tools' ? 'block' : 'hidden'}>
           <ToolsPage onAdd={handleAddTool} currentInputIds={currentInputIds} />
        </div>

        {/* MATERIALS PAGE VIEW */}
        <div className={currentView === 'materials' ? 'block' : 'hidden'}>
           <MaterialsPage onAdd={handleAddMaterial} currentInputIds={currentInputIds} />
        </div>

        {/* COMPONENTS PAGE VIEW */}
        <div className={currentView === 'components' ? 'block' : 'hidden'}>
           <ComponentsPage onAdd={handleAddComponent} currentInputIds={currentInputIds} />
        </div>

        {/* BUILDINGS PAGE VIEW */}
        <div className={currentView === 'buildings' ? 'block' : 'hidden'}>
           <BuildingsPage onAdd={handleAddBuilding} currentInputIds={currentInputIds} />
        </div>

        {/* CONSUMABLES PAGE VIEW */}
        <div className={currentView === 'consumables' ? 'block' : 'hidden'}>
           <ConsumablesPage onAdd={handleAddConsumable} currentInputIds={currentInputIds} />
        </div>

        {/* STATIONS PAGE VIEW */}
        <div className={currentView === 'stations' ? 'block' : 'hidden'}>
           <StationsPage onAdd={handleAddStation} currentInputIds={currentInputIds} />
        </div>

        {/* DECORATIONS PAGE VIEW */}
        <div className={currentView === 'decorations' ? 'block' : 'hidden'}>
           <DecorationsPage onAdd={handleAddDecoration} currentInputIds={currentInputIds} />
        </div>

        {/* TREASURE PAGE VIEW */}
        <div className={currentView === 'treasure' ? 'block' : 'hidden'}>
           <TreasurePage onAdd={handleAddTreasure} currentInputIds={currentInputIds} />
        </div>

        {/* UTILITY PAGE VIEW */}
        <div className={currentView === 'utility' ? 'block' : 'hidden'}>
           <UtilityPage onAdd={handleAddUtility} currentInputIds={currentInputIds} />
        </div>

        {/* WARPAINTS PAGE VIEW */}
        <div className={currentView === 'warpaints' ? 'block' : 'hidden'}>
           <WarpaintsPage onAdd={handleAddWarpaint} currentInputIds={currentInputIds} />
        </div>

        {/* CONVERTER PAGE VIEW */}
        <div className={currentView === 'converter' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'hidden'}>
          
          {/* Input Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-slate-800 p-1.5 rounded text-amber-500">1</span>
                Input Item Data
              </h2>
              <div className="flex gap-3">
                {user && (
                   <button
                   onClick={() => setIsSavesModalOpen(true)}
                   className="md:hidden text-xs text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest"
                 >
                   My Saves
                 </button>
                )}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors uppercase font-bold tracking-widest flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Resource
                </button>
                <button 
                  onClick={handleClear}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase font-bold tracking-widest"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={useAiPricing} 
                      onChange={(e) => setUseAiPricing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </div>
                  <span className={`text-sm font-bold ${useAiPricing ? 'text-purple-400' : 'text-slate-400'}`}>
                    AI Smart Pricing
                  </span>
                </label>
              </div>

              {useAiPricing ? (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Low Grind</span>
                    <span className="text-purple-400">Level {grindLevel}</span>
                    <span>High Grind</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={grindLevel}
                    onChange={(e) => setGrindLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-in fade-in duration-300">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={useDamagePricing} 
                      onChange={(e) => setUseDamagePricing(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-300">Calc from Dmg/Armor/Dura</span>
                  </label>
                  <div className={`flex items-center gap-2 border-l border-slate-800 pl-4 transition-opacity ${!useDamagePricing ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <span className="text-sm font-medium text-slate-400">Mult (X):</span>
                    <input 
                      type="number" 
                      value={multiplier}
                      onChange={(e) => setMultiplier(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-20 text-right font-mono"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ID, Name, Value..."
              className="w-full h-80 bg-slate-900 border border-slate-700 rounded-lg p-4 mono text-sm focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
            />

            <button
              onClick={() => handleConvert()}
              disabled={!inputText.trim() || isGenerating}
              className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                ${inputText.trim() && !isGenerating
                  ? useAiPricing ? 'bg-purple-600 hover:bg-purple-500' : 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              {isGenerating ? "Analyzing..." : "Convert to RuleData"}
            </button>

            {aiError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2 animate-in fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {aiError}
              </div>
            )}
          </section>

          {/* Output Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-slate-800 p-1.5 rounded text-amber-500">2</span>
                Serialized Results
              </h2>
              {results.length > 0 && (
                <button 
                  onClick={copyAll}
                  className={`text-xs uppercase font-bold tracking-widest flex items-center gap-1.5 transition-all
                    ${isCopiedAll ? 'text-green-500' : 'text-amber-500 hover:text-amber-400'}`}
                >
                  {isCopiedAll ? 'Copied Batch!' : 'Copy Batch (Import Code)'}
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
              {results.length === 0 ? (
                <div className="bg-slate-900 border border-slate-700 rounded-lg h-80 flex items-center justify-center text-slate-600 italic">
                  Results will appear here
                </div>
              ) : (
                <>
                  {/* Master Batch Card */}
                  <div className="bg-slate-900 border-2 border-amber-500/30 rounded-lg p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-lg">
                      Batch Import Ready
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100">Full RuleData Block</h3>
                        <p className="text-xs text-slate-500">{results.length} items bundled</p>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-md border border-slate-800 mono text-[10px] break-all text-slate-400 h-24 overflow-y-auto mb-4">
                      {batchString}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={copyAll}
                        className="flex-grow bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded font-bold text-sm uppercase transition-colors"
                      >
                        {isCopiedAll ? 'Copied!' : 'Copy Batch Import Code'}
                      </button>
                      
                      {user && (
                        <button
                          onClick={handleSaveBatch}
                          disabled={isSaving}
                          className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded flex items-center justify-center gap-2 font-bold text-sm uppercase transition-colors"
                          title="Save to My Imports"
                        >
                           {isSaving ? (
                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                           ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                             </svg>
                           )}
                           <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2">
                    <span className="w-10 h-[1px] bg-slate-800"></span>
                    Individual Item Breakdown
                    <span className="flex-grow h-[1px] bg-slate-800"></span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-lg divide-y divide-slate-800">
                    {results.map((res, idx) => (
                      <ResultCard 
                        key={idx} 
                        result={res} 
                        onCopy={() => copyToClipboard(res.output)} 
                        useDamagePricing={useDamagePricing && !useAiPricing}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

        </div>
      </main>
      <Footer />
      <ItemSelectorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleAddBaseItem} 
        currentInput={inputText}
      />
      
      {user && (
        <SavedBatchesModal 
          isOpen={isSavesModalOpen}
          onClose={() => setIsSavesModalOpen(false)}
          user={user}
          onLoad={handleLoadSavedBatch}
        />
      )}
    </div>
  );
};

interface ResultCardProps {
  result: ConversionResult;
  onCopy: () => void;
  useDamagePricing: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onCopy, useDamagePricing }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 hover:bg-slate-800/40 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded mr-2">
            ID: {result.input.id}
          </span>
          <span className="text-sm font-semibold text-slate-100">{result.input.name}</span>
          <div className="text-[10px] text-slate-500 mt-1 flex gap-3">
            <span>Price: <span className="text-amber-500 font-mono">{result.calculatedPrice}</span></span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-md transition-all ${
            copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
      <div className="bg-slate-950 p-2 rounded border border-slate-800 mono text-[9px] break-all text-slate-500 h-12 overflow-hidden overflow-y-auto">
        {result.output}
      </div>
    </div>
  );
};

export default App;
