
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs } from './components/ui/Tabs';
import { ProfileTab } from './components/ProfileTab';
import { CashflowTab } from './components/CashflowTab';
import { NetWorthTab } from './components/NetWorthTab';
import { SettingsTab } from './components/SettingsTab';
import { storage, getInitialState } from './services/storage';
import { AppState, IncomeMode } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storage.load());
  const [activeTab, setActiveTab] = useState('cashflow');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
        let newState = { ...prev, ...updates };

        if (updates.profile && updates.profile.incomeMode !== prev.profile.incomeMode) {
          const newMode = updates.profile.incomeMode;
          let newCashflow = [...newState.cashflow];

          const jointHeads = ['Salary', 'Spouse Salary', 'Bonus', 'Spouse Bonus'];
          const individualHeads = ['Salary', 'Bonus'];
          
          const targetHeads = newMode === IncomeMode.JOINT ? jointHeads : individualHeads;
          const headsToRemove = newMode === IncomeMode.INDIVIDUAL ? ['Spouse Salary', 'Spouse Bonus'] : [];

          targetHeads.forEach(headName => {
            const exists = newCashflow.find(i => i.name === headName && i.type === 'income');
            if (!exists) {
              newCashflow.push({
                id: Math.random().toString(36).substr(2, 9),
                name: headName,
                type: 'income',
                monthlyValues: Array(12).fill(0),
                isMaster: true
              });
            }
          });

          if (headsToRemove.length > 0) {
            newCashflow = newCashflow.filter(i => 
              !(i.type === 'income' && headsToRemove.includes(i.name))
            );
          }

          newState.cashflow = newCashflow;
        }

        return newState;
    });
    setSaveStatus('saving');
  }, []);

  const saveNow = useCallback(() => {
    setSaveStatus('saving');
    storage.save(state);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  }, [state]);

  const resetData = useCallback(() => {
    if (window.confirm('CRITICAL: This will permanently wipe all your data and reset everything to zero. This cannot be undone. Proceed?')) {
      storage.clear();
      const freshState = getInitialState();
      setState(freshState);
      setActiveTab('profile'); // Return to start
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        alert('All data has been reset to defaults.');
      }, 500);
    }
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `family-wealth-data-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setState(json);
        storage.save(json);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Error importing file. Please ensure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (saveStatus === 'saving') {
        const timer = setTimeout(() => {
            storage.save(state);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [state, saveStatus]);

  const tabs = [
    { id: 'profile', label: 'Profile & Family', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'cashflow', label: 'Monthly Cashflow', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'networth', label: 'Net Worth Engine', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'settings', label: 'Masters & Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Family Wealth Architect</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Secure Household Planner</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 border-r border-gray-200 pr-4 mr-2">
                {saveStatus === 'saving' && <span className="text-xs text-amber-600 font-medium animate-pulse flex items-center gap-1"><div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping"></div> Syncing...</span>}
                {saveStatus === 'saved' && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Data Saved</span>}
                {saveStatus === 'idle' && <span className="text-xs text-gray-400 font-medium">Ready</span>}
            </div>
            <button 
              onClick={handleExport}
              className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
        </div>
      </header>

      <main className="flex-grow flex flex-col bg-slate-50">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="flex-grow overflow-y-auto">
          {activeTab === 'profile' && <ProfileTab data={state} update={updateState} onSave={saveNow} onReset={resetData} />}
          {activeTab === 'cashflow' && <CashflowTab data={state} update={updateState} onSave={saveNow} onReset={resetData} />}
          {activeTab === 'networth' && <NetWorthTab data={state} update={updateState} onSave={saveNow} onReset={resetData} />}
          {activeTab === 'settings' && (
            <SettingsTab 
              data={state} 
              update={updateState} 
              onSave={saveNow} 
              onReset={resetData} 
              onImportClick={() => fileInputRef.current?.click()} 
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-3 text-center">
        <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Family Wealth Architect &bull; Private &bull; Local-First
        </p>
      </footer>
    </div>
  );
};

export default App;
