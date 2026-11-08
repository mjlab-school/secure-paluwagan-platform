'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      <Link href="/dashboard" className="text-xl font-bold text-blue-600">
        Paluwagan Platform
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
          Dashboard
        </Link>
        <Link href="/kyc" className="text-gray-600 hover:text-blue-600 font-medium">
          KYC Verification
        </Link>
        <Link href="/profile" className="text-gray-600 hover:text-blue-600 font-medium">
          Profile & Batches
        </Link>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}