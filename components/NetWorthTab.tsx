
import React from 'react';
import { AppState, Asset, Liability } from '../types';
import { formatINR, parseAmount } from '../utils/formatters';

interface Props {
  data: AppState;
  update: (updates: Partial<AppState>) => void;
  onSave: () => void;
  onReset?: () => void;
}

export const NetWorthTab: React.FC<Props> = ({ data, update, onSave, onReset }) => {
  const monthlyCalculations = (() => {
    const calcs = [];
    let runningBalance = data.initialOpeningBalance;
    for (let i = 0; i < 12; i++) {
      let income = 0; let expense = 0;
      data.cashflow.forEach(item => {
        if (item.type === 'income') income += item.monthlyValues[i];
        else expense += item.monthlyValues[i];
      });
      const closing = runningBalance + income - expense;
      calcs.push({ closing });
      runningBalance = closing;
    }
    return calcs;
  })();

  const annualSavingsDelta = monthlyCalculations[11].closing - data.initialOpeningBalance;
  const currentAssetsTotal = data.assets.reduce((sum, a) => sum + a.currentValue, 0);
  const currentLiabilitiesTotal = data.liabilities.reduce((sum, l) => sum + l.outstandingPrincipal, 0);
  const presentNetWorth = currentAssetsTotal - currentLiabilitiesTotal + data.initialOpeningBalance;

  const projectedAssets = data.assets.reduce((sum, a) => {
    return sum + (a.currentValue * (1 + a.appreciationPercent / 100));
  }, 0);

  const projectedLiabilities = data.liabilities.reduce((sum, l) => {
    const annualEMI = l.emi * 12;
    const principalPaid = annualEMI * (l.principalComponentPercent / 100);
    return sum + (l.outstandingPrincipal - principalPaid);
  }, 0);

  const eoyNetWorth = projectedAssets - projectedLiabilities + monthlyCalculations[11].closing;

  const totalCap = currentAssetsTotal + data.initialOpeningBalance + currentLiabilitiesTotal;
  const assetRatio = totalCap > 0 ? ((currentAssetsTotal + data.initialOpeningBalance) / totalCap) * 100 : 0;

  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    const updated = data.assets.map(a => a.id === id ? { ...a, [field]: value } : a);
    update({ assets: updated });
  };

  const updateLiability = (id: string, field: keyof Liability, value: any) => {
    const updated = data.liabilities.map(l => l.id === id ? { ...l, [field]: value } : l);
    update({ liabilities: updated });
  };

  const addAsset = () => {
    update({ assets: [...data.assets, { id: Date.now().toString(), name: 'New Asset', type: 'Investment', currentValue: 0, appreciationPercent: 0 }] });
  };

  const addLiability = () => {
    update({ liabilities: [...data.liabilities, { id: Date.now().toString(), name: 'New Loan', outstandingPrincipal: 0, emi: 0, principalComponentPercent: 0 }] });
  };

  const removeAsset = (id: string) => {
    update({ assets: data.assets.filter(a => a.id !== id) });
  };

  const removeLiability = (id: string) => {
    update({ liabilities: data.liabilities.filter(l => l.id !== id) });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Net Worth Engine</h2>
        <div className="flex gap-3">
          {onReset && (
            <button 
              onClick={onReset}
              className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Reset Data
            </button>
          )}
          <button 
            onClick={onSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Save Net Worth
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Current Net Worth</p>
            <h2 className="text-4xl font-black text-slate-900">{formatINR(presentNetWorth)}</h2>
            <div className="mt-6">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                    <span className="text-indigo-600">Assets</span>
                    <span className="text-red-500">Liabilities</span>
                </div>
                <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${assetRatio}%` }}></div>
                </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 flex gap-8 relative">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black">Gross Assets</p>
              <p className="text-lg font-bold text-indigo-600">{formatINR(currentAssetsTotal + data.initialOpeningBalance)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black">Debt Pool</p>
              <p className="text-lg font-bold text-red-600">{formatINR(currentLiabilitiesTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Projected Dec 31 Net Worth</p>
            <h2 className="text-4xl font-black text-white">{formatINR(eoyNetWorth)}</h2>
            <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${eoyNetWorth >= presentNetWorth ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {eoyNetWorth >= presentNetWorth ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                )}
                {formatINR(Math.abs(eoyNetWorth - presentNetWorth))} {eoyNetWorth >= presentNetWorth ? 'Appreciation' : 'Depreciation'}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 relative">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Composition Engine</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase">Cash Inflow</p>
                    <p className="text-sm font-bold text-emerald-400">+{formatINR(annualSavingsDelta)}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase">Debt Reduction</p>
                    <p className="text-sm font-bold text-indigo-400">-{formatINR(currentLiabilitiesTotal - projectedLiabilities)}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                Asset Portfolio
            </h3>
            <button onClick={addAsset} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Asset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Asset Name</th>
                  <th className="px-4 py-3 text-left">Classification</th>
                  <th className="px-4 py-3 text-right">Current Value</th>
                  <th className="px-4 py-3 text-right">Growth Rate %</th>
                  <th className="px-4 py-3 text-right">Target Value</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.assets.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 py-4 font-bold text-slate-700"><input className="bg-transparent outline-none w-full" value={a.name} onChange={e => updateAsset(a.id, 'name', e.target.value)} /></td>
                    <td className="px-4 py-4 text-gray-500 italic"><input className="bg-transparent outline-none w-full" value={a.type} onChange={e => updateAsset(a.id, 'type', e.target.value)} /></td>
                    <td className="px-4 py-4">
                        <input className="bg-transparent outline-none w-full text-right font-black text-indigo-600" 
                        value={a.currentValue === 0 ? '' : a.currentValue} 
                        placeholder="0"
                        onChange={e => updateAsset(a.id, 'currentValue', parseAmount(e.target.value))} />
                    </td>
                    <td className="px-4 py-4 text-right">
                        <input className="bg-slate-100 px-2 py-1 rounded w-16 text-right font-bold text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500" 
                        value={a.appreciationPercent} 
                        onChange={e => updateAsset(a.id, 'appreciationPercent', parseFloat(e.target.value) || 0)} />%
                    </td>
                    <td className="px-4 py-4 text-right text-emerald-600 font-black text-base">{formatINR(a.currentValue * (1 + a.appreciationPercent/100), true)}</td>
                    <td className="px-4 py-4 text-right">
                        <button onClick={() => removeAsset(a.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                Liability Registry
            </h3>
            <button onClick={addLiability} className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Loan
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Loan Name</th>
                  <th className="px-4 py-3 text-right">Principal O/S</th>
                  <th className="px-4 py-3 text-right">Monthly EMI</th>
                  <th className="px-4 py-3 text-right">Principal %</th>
                  <th className="px-4 py-3 text-right">Target Balance</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.liabilities.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50 group">
                    <td className="px-4 py-4 font-bold text-slate-700"><input className="bg-transparent outline-none w-full" value={l.name} onChange={e => updateLiability(l.id, 'name', e.target.value)} /></td>
                    <td className="px-4 py-4"><input className="bg-transparent outline-none w-full text-right font-black text-red-500" value={l.outstandingPrincipal === 0 ? '' : l.outstandingPrincipal} onChange={e => updateLiability(l.id, 'outstandingPrincipal', parseAmount(e.target.value))} /></td>
                    <td className="px-4 py-4"><input className="bg-transparent outline-none w-full text-right font-medium" value={l.emi === 0 ? '' : l.emi} onChange={e => updateLiability(l.id, 'emi', parseAmount(e.target.value))} /></td>
                    <td className="px-4 py-4 text-right"><input className="bg-slate-100 px-2 py-1 rounded w-16 text-right font-bold text-gray-700 outline-none focus:ring-1 focus:ring-red-500" value={l.principalComponentPercent} onChange={e => updateLiability(l.id, 'principalComponentPercent', parseFloat(e.target.value) || 0)} />%</td>
                    <td className="px-4 py-4 text-right text-indigo-600 font-black text-base">{formatINR(l.outstandingPrincipal - (l.emi * 12 * (l.principalComponentPercent / 100)), true)}</td>
                    <td className="px-4 py-4 text-right">
                        <button onClick={() => removeLiability(l.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-900 leading-relaxed italic">
            <strong>Engine Note:</strong> "Target Value" for Assets calculates the simple appreciation based on your Growth Rate. For Liabilities, it estimates the remaining principal balance after 12 EMI payments using the "Principal %" (which is the portion of your EMI that goes toward principal rather than interest). These are 12-month linear projections.
          </p>
      </div>
    </div>
  );
};
