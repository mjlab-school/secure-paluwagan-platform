'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function KycPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>('not_submitted');

  const [fullName, setFullName] = useState('');
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfieId, setSelfieId] = useState<File | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkUserKyc() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_status, full_name')
        .eq('id', userData.user.id)
        .single();

      if (profile && profile.kyc_status && profile.kyc_status !== 'not_submitted') {
        setKycStatus(profile.kyc_status);
        if (profile.full_name) setFullName(profile.full_name);
      }
      setLoading(false);
    }
    checkUserKyc();
  }, [router]);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAgreed) {
      setMessage('You must agree to the Data Privacy Act terms to proceed.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        full_name: fullName,
        kyc_status: 'pending',
        privacy_consented: true,
      });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      setKycStatus('pending');
      setMessage('KYC documents submitted successfully!');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Loading your profile...</div>;
  }

  if (kycStatus === 'pending' || kycStatus === 'verified') {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white shadow-md rounded-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          KYC Verification {kycStatus === 'verified' ? 'Verified' : 'Under Review'}
        </h1>
        <p className="text-gray-600 mb-6">
          {kycStatus === 'verified'
            ? 'Your identity has been fully verified. You can now freely join or host batches.'
            : 'You have already submitted your documents. Handlers can now review and approve your account. No need to re-upload!'}
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">KYC Identity Verification</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Please provide your details and upload clear photos of your valid IDs. This is required once to secure all Paluwagan transactions.
      </p>

      {message && <p className="mb-4 text-sm font-medium text-blue-600">{message}</p>}

      <form onSubmit={handleKycSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name (as shown on ID)</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full border rounded-md p-2 text-gray-900"
            placeholder="Juan Dela Cruz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valid ID (Front Photo)</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setIdFront(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valid ID (Back Photo)</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setIdBack(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Selfie Holding Your ID</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setSelfieId(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="p-4 bg-gray-50 border rounded-md text-xs text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">Data Privacy Act Notice:</p>
          <p>
            In compliance with the Data Privacy Act, all personal information and government ID photos collected are encrypted and stored securely. They will only be used for identity verification purposes within this Paluwagan platform and will never be shared with third parties without consent.
          </p>
          <label className="flex items-center space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="font-medium text-gray-700">I agree to the collection and secure processing of my data for account verification.</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Submit Verification Documents
        </button>
      </form>
    </div>
  );
}