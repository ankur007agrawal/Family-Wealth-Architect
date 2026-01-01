
import React, { useState } from 'react';
import { AppState, MONTHS, CashflowItem, IncomeMode } from '../types';
import { formatINR, parseAmount } from '../utils/formatters';

interface Props {
  data: AppState;
  update: (updates: Partial<AppState>) => void;
  onSave: () => void;
  onReset?: () => void;
}

export const CashflowTab: React.FC<Props> = ({ data, update, onSave, onReset }) => {
  const [showAddModal, setShowAddModal] = useState<{ type: 'income' | 'expense' } | null>(null);
  
  const handleValueChange = (itemId: string, monthIdx: number, value: string) => {
    const numValue = parseAmount(value);
    const updated = data.cashflow.map(item => {
      if (item.id === itemId) {
        const newValues = [...item.monthlyValues];
        newValues[monthIdx] = numValue;
        return { ...item, monthlyValues: newValues };
      }
      return item;
    });
    update({ cashflow: updated });
  };

  const replicateValues = (itemId: string) => {
    const updated = data.cashflow.map(item => {
      if (item.id === itemId) {
        const janValue = item.monthlyValues[0];
        return { ...item, monthlyValues: Array(12).fill(janValue) };
      }
      return item;
    });
    update({ cashflow: updated });
  };

  const addRow = (type: 'income' | 'expense', categoryName: string) => {
    // Check if this category is already in the table for this type
    if (data.cashflow.find(i => i.name === categoryName && i.type === type)) {
      setShowAddModal(null);
      return;
    }

    const newRow: CashflowItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: categoryName,
      type,
      monthlyValues: Array(12).fill(0)
    };
    update({ cashflow: [...data.cashflow, newRow] });
    setShowAddModal(null);
  };

  const removeRow = (id: string) => {
    update({ cashflow: data.cashflow.filter(i => i.id !== id) });
  };

  // Logic for carry-over balances (Closing = Opening + Income - Expense)
  const monthlyCalculations = (() => {
    const calcs = [];
    let runningBalance = data.initialOpeningBalance;

    for (let i = 0; i < 12; i++) {
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      data.cashflow.forEach(item => {
        if (item.type === 'income') monthlyIncome += item.monthlyValues[i];
        else monthlyExpense += item.monthlyValues[i];
      });

      const opening = runningBalance;
      const totalAvailable = opening + monthlyIncome;
      const closing = totalAvailable - monthlyExpense;

      calcs.push({
        opening,
        income: monthlyIncome,
        available: totalAvailable,
        expense: monthlyExpense,
        closing
      });

      runningBalance = closing;
    }
    return calcs;
  })();

  const renderTable = (type: 'income' | 'expense') => {
    const filtered = data.cashflow.filter(i => i.type === type);
    
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 font-bold">
            <tr>
              <th className="px-4 py-3 min-w-[220px] sticky left-0 bg-gray-50 z-10 border-r border-gray-100">
                {type === 'income' ? 'Income Heads' : 'Expense Heads'}
              </th>
              {MONTHS.map(m => (
                <th key={m} className="px-4 py-3 min-w-[110px] text-center border-l border-gray-100/50">{m}</th>
              ))}
              <th className="px-4 py-3 min-w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* 1. Opening Balance Row (Income Only) */}
            {type === 'income' && (
              <tr className="bg-slate-50/50 font-medium">
                <td className="px-4 py-3 sticky left-0 bg-slate-50 z-10 border-r border-gray-100 text-indigo-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Opening Balance
                  </div>
                </td>
                {MONTHS.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-right border-l border-gray-100/50">
                    {idx === 0 ? (
                      <div className="flex items-center justify-end group">
                        <span className="text-gray-400 mr-1 text-[10px]">₹</span>
                        <input
                          type="text"
                          className="w-full text-right px-2 py-1 bg-white border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600 shadow-sm"
                          value={data.initialOpeningBalance || 0}
                          onChange={(e) => update({ initialOpeningBalance: parseAmount(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-gray-500 font-semibold">
                        {formatINR(monthlyCalculations[idx].opening, true)}
                      </span>
                    )}
                  </td>
                ))}
                <td></td>
              </tr>
            )}

            {/* 2. User-added rows - STATIC LABEL */}
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3 font-semibold text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.name}</span>
                    <button 
                      onClick={() => replicateValues(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-indigo-500 hover:bg-indigo-50 rounded transition-all"
                      title="Copy Jan value to all months"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </td>
                {item.monthlyValues.map((val, idx) => (
                  <td key={idx} className="px-2 py-2 border-l border-gray-100/50">
                    <input
                      type="text"
                      className={`w-full text-right px-2 py-1.5 border border-transparent hover:border-gray-200 focus:border-indigo-500 rounded outline-none bg-transparent ${idx === 0 ? 'font-bold text-indigo-600' : ''}`}
                      value={val === 0 ? '' : val}
                      placeholder="0"
                      onChange={(e) => handleValueChange(item.id, idx, e.target.value)}
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => removeRow(item.id)} 
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Remove row"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty State / Add Suggestion */}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={14} className="px-4 py-8 text-center text-gray-400 italic text-xs bg-gray-50/20">
                  No {type} heads added. Use the button above to select categories from your Master List.
                </td>
              </tr>
            )}

            {/* Total Row */}
            <tr className="bg-indigo-50/50 font-bold text-indigo-800 border-t-2 border-indigo-100/50">
              <td className="px-4 py-4 sticky left-0 bg-indigo-50 z-10 border-r border-indigo-100 uppercase text-[10px] tracking-wider">
                {type === 'income' ? 'Total Monthly Inflow (A+B)' : `Total Monthly ${type} (C)`}
              </td>
              {MONTHS.map((_, i) => (
                <td key={i} className="px-4 py-4 text-right border-l border-indigo-100/50">
                  {formatINR(type === 'income' ? monthlyCalculations[i].available : monthlyCalculations[i].expense, true)}
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Cashflow Engine</h2>
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
            Save Cashflow
          </button>
        </div>
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-xs text-indigo-800 leading-relaxed">
          <strong>Tip:</strong> Hover over an Income or Expense head and click the <svg className="w-3 h-3 inline mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg> <strong>Double Arrow</strong> icon to quickly copy the January value to the entire year.
        </p>
      </div>

      {/* 1. Header Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Year Starting Liquidity (Jan 1)</label>
          <div className="text-3xl font-black text-gray-900">
            {formatINR(data.initialOpeningBalance)}
          </div>
          <p className="mt-1 text-[10px] text-gray-400 font-medium italic">Update in "Opening Balance" row below</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 flex flex-col justify-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Projected Annual Savings</div>
          <div className="text-3xl font-black text-emerald-600">
            {formatINR(monthlyCalculations[11].closing - data.initialOpeningBalance)}
          </div>
          <p className="mt-1 text-[10px] text-gray-400 font-medium">Net wealth growth from cashflow</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 flex flex-col justify-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Final December Balance</div>
            <div className="text-3xl font-black text-blue-600">
                {formatINR(monthlyCalculations[11].closing)}
            </div>
            <p className="mt-1 text-[10px] text-gray-400 font-medium">Liquid funds at year-end</p>
        </div>
      </div>

      {/* 2. Income Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              Income Sources
            </h3>
            <p className="text-[10px] text-gray-400 ml-3.5 italic">Heads are sourced from Category Master in Settings</p>
          </div>
          <button 
            onClick={() => setShowAddModal({ type: 'income' })} 
            className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 font-bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Income Head
          </button>
        </div>
        {renderTable('income')}
      </section>

      {/* 3. Expense Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
              Expense Heads
            </h3>
            <p className="text-[10px] text-gray-400 ml-3.5 italic">Track and forecast your monthly outflows</p>
          </div>
          <button 
            onClick={() => setShowAddModal({ type: 'expense' })} 
            className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 font-bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Expense Head
          </button>
        </div>
        {renderTable('expense')}
      </section>

      {/* 4. Carry-over Trail Map */}
      <section className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl border border-slate-800 mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h3 className="text-xl font-black mb-1 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    Cashflow Carry-over Trail
                </h3>
                <p className="text-slate-400 text-xs">Monthly liquidity movement summary</p>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-800">
                        <th className="px-4 py-4 text-left min-w-[200px]">Liquidity Breakdown</th>
                        {MONTHS.map(m => <th key={m} className="px-4 py-4 text-center border-l border-slate-800/50">{m}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    <tr className="group">
                        <td className="px-4 py-4 font-medium text-slate-400 italic">Opening Month Balance</td>
                        {monthlyCalculations.map((s, i) => (
                            <td key={i} className="px-4 py-4 text-center text-slate-300 font-mono border-l border-slate-800/50">
                                {formatINR(s.opening, true)}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td className="px-4 py-4 font-medium text-slate-400 italic">(+) New Monthly Income</td>
                        {monthlyCalculations.map((s, i) => (
                            <td key={i} className="px-4 py-4 text-center text-emerald-400/80 font-mono border-l border-slate-800/50">
                                {formatINR(s.income, true)}
                            </td>
                        ))}
                    </tr>
                    <tr className="bg-indigo-500/5">
                        <td className="px-4 py-4 font-black text-indigo-400 uppercase text-[10px]">Funds Available (A)</td>
                        {monthlyCalculations.map((s, i) => (
                            <td key={i} className="px-4 py-4 text-center font-black text-indigo-300 font-mono border-l border-slate-800/50">
                                {formatINR(s.available, true)}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td className="px-4 py-4 font-medium text-slate-400 italic">(-) Total Monthly Expenses (B)</td>
                        {monthlyCalculations.map((s, i) => (
                            <td key={i} className="px-4 py-4 text-center text-red-400/80 font-mono border-l border-slate-800/50">
                                {formatINR(s.expense, true)}
                            </td>
                        ))}
                    </tr>
                    <tr className="bg-slate-800/50">
                        <td className="px-4 py-6 font-black text-white uppercase text-[11px] tracking-widest">Month-End Balance (A-B)</td>
                        {monthlyCalculations.map((s, i) => (
                            <td key={i} className={`px-4 py-6 text-center font-black text-lg font-mono border-l border-slate-800/50 ${s.closing >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatINR(s.closing, true)}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
      </section>

      {/* 5. Master Category Selection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="text-xl font-black text-slate-900 capitalize">Pick {showAddModal.type} Head</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sourced from your Category Master</p>
              </div>
              <button 
                onClick={() => setShowAddModal(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {data.categories[showAddModal.type].map(cat => {
                  const isExisting = data.cashflow.some(i => i.name === cat && i.type === showAddModal.type);
                  return (
                    <button
                      key={cat}
                      disabled={isExisting}
                      onClick={() => addRow(showAddModal.type, cat)}
                      className={`group flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                        isExisting 
                        ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' 
                        : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-bold ${isExisting ? 'text-slate-400' : 'text-slate-800'}`}>{cat}</span>
                        {!isExisting && <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium uppercase">{isExisting ? 'Already in table' : 'Add to table'}</span>
                    </button>
                  );
                })}
              </div>
              {data.categories[showAddModal.type].length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No categories found in Master List.</p>
                  <p className="text-xs text-indigo-500 mt-2">Go to "Masters & Settings" to define them.</p>
                </div>
              )}
            </div>
            <div className="px-8 py-4 bg-indigo-50/50 border-t border-indigo-50 text-[10px] text-indigo-400 text-center font-bold italic">
              * Add or edit categories in the <span className="underline">Masters & Settings</span> tab
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
