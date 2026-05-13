'use client';

import { Suspense } from 'react';
import ResetPasswordClientPage from './ResetPasswordClientPage';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="pt-20 text-center">Loading reset page...</div>}>
      <ResetPasswordClientPage />
    </Suspense>
  );
}
