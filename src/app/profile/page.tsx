'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'joined' | 'handler'>('joined');
  const [isVerified, setIsVerified] = useState(false);
  
  // Handler form states
  const [batchTitle, setBatchTitle] = useState('');
  const [minDeposit, setMinDeposit] = useState('');
  const [contribution, setContribution] = useState('');
  const [selectionMethod, setSelectionMethod] = useState<'wheel_of_fortune' | 'by_slot'>('by_slot');
  const [message, setMessage] = useState('');

  // Handler: Open a new batch where you are the handler
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from('paluwagan_batches').insert([
      {
        handler_id: userData.user.id,
        title: batchTitle,
        contribution_amount: parseFloat(contribution),
        min_deposit: parseFloat(minDeposit),
        selection_method: selectionMethod,
        status: 'open',
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('New Paluwagan Batch opened successfully!');
      setBatchTitle('');
      setContribution('');
      setMinDeposit('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Unified Account & Profile</h1>
      <p className="text-gray-600 mb-6">
        You can create and manage your own Paluwagan groups as a Handler, or participate in other groups as a Joiner.
      </p>

      {/* Account Status Card */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-md flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">KYC Verification Status</h3>
          <p className="text-sm text-gray-600">Verification lets Handlers approve your batch join requests.</p>
        </div>
        <div>
          {isVerified ? (
            <span className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full">Verified</span>
          ) : (
            <span className="px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending KYC</span>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('joined')}
          className={`py-2 px-6 font-medium border-b-2 transition ${
            activeTab === 'joined' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Joined Batches (Joiner)
        </button>
        <button
          onClick={() => setActiveTab('handler')}
          className={`py-2 px-6 font-medium border-b-2 transition ${
            activeTab === 'handler' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Hosted Batches (Handler)
        </button>
      </div>

      {/* Tab 1: Joined Batches */}
      {activeTab === 'joined' && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Batches You Joined</h2>
          <p className="text-sm text-gray-500">Track your active contributions, deposit approvals, and assigned slots here.</p>
        </div>
      )}

      {/* Tab 2: Handler Management & Create Batch */}
      {activeTab === 'handler' && (
        <div className="space-y-6">
          <div className="border p-5 rounded-md bg-slate-50">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Open New Paluwagan Batch</h2>
            {message && <p className="mb-4 text-sm font-medium text-blue-600">{message}</p>}

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Title</label>
                <input
                  type="text"
                  required
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  className="mt-1 w-full border rounded-md p-2 text-gray-900"
                  placeholder="e.g. Monthly Savings Group A"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contribution Amount (₱)</label>
                  <input
                    type="number"
                    required
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2 text-gray-900"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Deposit Required (₱)</label>
                  <input
                    type="number"
                    required
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2 text-gray-900"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Assignment Method</label>
                <select
                  value={selectionMethod}
                  onChange={(e) => setSelectionMethod(e.target.value as 'wheel_of_fortune' | 'by_slot')}
                  className="w-full border rounded-md p-2 text-gray-900"
                >
                  <option value="by_slot">By Preferred Slot (First-Come, First-Served)</option>
                  <option value="wheel_of_fortune">Wheel of Fortune (Random Draw)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Create & Open Batch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}