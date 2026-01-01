
import React, { useState } from 'react';
import { AppState } from '../types';

interface Props {
  data: AppState;
  update: (updates: Partial<AppState>) => void;
  onSave: () => void;
  onReset?: () => void;
  onImportClick?: () => void;
}

export const SettingsTab: React.FC<Props> = ({ data, update, onSave, onReset, onImportClick }) => {
  const [newCat, setNewCat] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');

  const addCategory = () => {
    if (!newCat.trim()) return;
    const current = data.categories[catType];
    if (current.includes(newCat)) return;
    
    update({
      categories: {
        ...data.categories,
        [catType]: [...current, newCat]
      }
    });
    setNewCat('');
  };

  const removeCategory = (type: 'income' | 'expense', name: string) => {
    update({
      categories: {
        ...data.categories,
        [type]: data.categories[type].filter(c => c !== name)
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Masters & Settings</h2>
        <div className="flex gap-3">
          {onReset && (
            <button 
              onClick={onReset}
              className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Reset All
            </button>
          )}
          <button 
            onClick={onSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Save Settings
          </button>
        </div>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-900">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Data Management
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={onImportClick}
                className="flex-1 border-2 border-dashed border-gray-200 p-6 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group flex flex-col items-center justify-center text-center"
            >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h4 className="font-bold text-gray-900">Import Data</h4>
                <p className="text-xs text-gray-500 mt-1">Upload a previously exported JSON file</p>
            </button>
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-100">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h4 className="font-bold text-gray-900">Privacy First</h4>
                <p className="text-xs text-gray-500 mt-1">All data stays in your browser. No cloud sync by design.</p>
            </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Category Master</h3>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-grow flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
            <select 
              className="bg-gray-50 border-r border-gray-200 px-3 text-sm outline-none font-bold text-gray-700"
              value={catType}
              onChange={(e) => setCatType(e.target.value as any)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input 
              type="text" 
              className="flex-grow px-3 py-2 outline-none text-sm"
              placeholder="New category name..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
          </div>
          <button 
            onClick={addCategory}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            Add
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Income Categories</h4>
            <div className="flex flex-wrap gap-2">
              {data.categories.income.map(cat => (
                <div key={cat} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800">
                  {cat}
                  <button onClick={() => removeCategory('income', cat)} className="text-emerald-300 hover:text-red-500 font-bold ml-1 transition-colors">×</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Expense Categories</h4>
            <div className="flex flex-wrap gap-2">
              {data.categories.expense.map(cat => (
                <div key={cat} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-800">
                  {cat}
                  <button onClick={() => removeCategory('expense', cat)} className="text-indigo-300 hover:text-red-500 font-bold ml-1 transition-colors">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-4">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          Category modifications will update the selection lists in the Cashflow tab. Deleting a category from here does NOT delete existing rows in your cashflow, but will prevent adding new ones.
        </p>
      </div>
    </div>
  );
};
