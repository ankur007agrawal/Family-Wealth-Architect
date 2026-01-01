
import React from 'react';
import { AppState, IncomeMode, FamilyMember } from '../types';

interface Props {
  data: AppState;
  update: (updates: Partial<AppState>) => void;
  onSave: () => void;
  onReset?: () => void;
}

export const ProfileTab: React.FC<Props> = ({ data, update, onSave, onReset }) => {
  const { profile } = data;

  const handleProfileChange = (field: string, value: any) => {
    update({
      profile: { ...profile, [field]: value }
    });
  };

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      age: 0,
      relation: 'Dependent'
    };
    update({
      profile: { ...profile, familyMembers: [...profile.familyMembers, newMember] }
    });
  };

  const removeFamilyMember = (id: string) => {
    update({
      profile: { ...profile, familyMembers: profile.familyMembers.filter(m => m.id !== id) }
    });
  };

  const updateFamilyMember = (id: string, field: string, value: any) => {
    const updated = profile.familyMembers.map(m => m.id === id ? { ...m, [field]: value } : m);
    update({ profile: { ...profile, familyMembers: updated } });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">User Profile</h2>
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
            Save Changes
          </button>
        </div>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Age</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={profile.age}
              onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Occupation</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={profile.occupation}
              onChange={(e) => handleProfileChange('occupation', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Family Registry</h3>
          <button
            onClick={addFamilyMember}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
          >
            + Add Member
          </button>
        </div>
        {profile.familyMembers.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 italic">No family members added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.familyMembers.map((member) => (
              <div key={member.id} className="flex gap-4 items-end">
                <div className="flex-grow">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                    value={member.age}
                    onChange={(e) => updateFamilyMember(member.id, 'age', parseInt(e.target.value))}
                  />
                </div>
                <div className="w-40">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Relation</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white"
                    value={member.relation}
                    onChange={(e) => updateFamilyMember(member.id, 'relation', e.target.value)}
                  >
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Parent</option>
                    <option>Sibling</option>
                    <option>Dependent</option>
                  </select>
                </div>
                <button
                  onClick={() => removeFamilyMember(member.id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Configuration</h3>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-bold ${profile.incomeMode === IncomeMode.INDIVIDUAL ? 'text-indigo-600' : 'text-gray-400'}`}>Individual</span>
          <button
            onClick={() => handleProfileChange('incomeMode', profile.incomeMode === IncomeMode.INDIVIDUAL ? IncomeMode.JOINT : IncomeMode.INDIVIDUAL)}
            className={`relative w-14 h-7 rounded-full transition-colors flex items-center ${profile.incomeMode === IncomeMode.JOINT ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${profile.incomeMode === IncomeMode.JOINT ? 'translate-x-7' : ''}`} />
          </button>
          <span className={`text-sm font-bold ${profile.incomeMode === IncomeMode.JOINT ? 'text-indigo-600' : 'text-gray-400'}`}>Joint (Self + Spouse)</span>
        </div>
        <p className="mt-3 text-xs text-gray-400 font-medium">
          <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          Joint mode will enable separate income tracking for your spouse across the cashflow engine.
        </p>
      </section>

      <div className="pt-8 text-center">
         <button 
          onClick={onSave}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 mx-auto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          Commit Profile Changes
        </button>
      </div>
    </div>
  );
};
