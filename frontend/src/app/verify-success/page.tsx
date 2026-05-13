'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifySuccess() {
  const router = useRouter();

  useEffect(() => {
  const timeout = setTimeout(() => {
    router.push('/login'); 
  }, 3000);
  return () => clearTimeout(timeout);
}, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Email verification successful!</h1>
        <p className="text-gray-700">You can now log in immediately.</p>
        <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
      </div>
    </div>
  );
}
