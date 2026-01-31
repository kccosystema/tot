import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'https://esm.sh/firebase@12.8.0/firestore';
import { User } from 'https://esm.sh/firebase@12.8.0/auth';

interface SavedBatch {
  id: string;
  name: string;
  itemCount: number;
  timestamp: string;
  inputRaw: string;
  results: any[];
}

interface SavedBatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLoad: (inputRaw: string) => void;
}

const SavedBatchesModal: React.FC<SavedBatchesModalProps> = ({ isOpen, onClose, user, onLoad }) => {
  const [saves, setSaves] = useState<SavedBatch[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSaves = async () => {
    setLoading(true);
    try {
      // Modular SDK: query(collection(...), ...)
      const q = query(
        collection(db, 'users', user.uid, 'saved_batches'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);

      const fetchedSaves: SavedBatch[] = [];
      querySnapshot.forEach((doc) => {
        fetchedSaves.push({ id: doc.id, ...doc.data() } as SavedBatch);
      });
      setSaves(fetchedSaves);
    } catch (error) {
      console.error("Error fetching saves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchSaves();
    }
  }, [isOpen, user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this save?')) {
      try {
        // Modular SDK: deleteDoc(doc(...))
        await deleteDoc(doc(db, 'users', user.uid, 'saved_batches', id));
        setSaves(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error("Error deleting save:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Saved Imports
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 scrollbar-thin">
          {loading ? (
            <div className="text-center text-slate-500 py-8">Loading saved batches...</div>
          ) : saves.length === 0 ? (
            <div className="text-center text-slate-500 py-8 flex flex-col items-center">
              <span className="text-4xl mb-2">📦</span>
              <p>No saved batches yet.</p>
              <p className="text-xs mt-2">Generate a batch and click "Save" to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {saves.map(save => (
                <div 
                  key={save.id}
                  onClick={() => { onLoad(save.inputRaw); onClose(); }}
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg p-4 cursor-pointer transition-all group flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {save.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                      <span>{new Date(save.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{save.itemCount} Items</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <button 
                      onClick={(e) => handleDelete(save.id, e)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Save"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="bg-slate-900 text-slate-400 px-3 py-1 rounded text-xs font-bold uppercase group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      Load
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedBatchesModal;