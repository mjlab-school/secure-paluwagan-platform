'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for confirmation, or log in if confirmation is disabled.');
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('kyc_status')
          .eq('id', signInData.user.id)
          .single();

        if (!profile || profile.kyc_status === 'not_submitted') {
          setMessage('Success! Redirecting to KYC setup...');
          setTimeout(() => router.push('/kyc'), 1500);
        } else {
          setMessage('Success! Redirecting to your dashboard...');
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        {isSignUp
          ? 'Sign up to access the Paluwagan platform'
          : 'Welcome back! Please enter your details'}
      </p>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded border text-center">
          {message}
        </p>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage('');
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}