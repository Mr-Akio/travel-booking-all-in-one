'use client';

import { Suspense } from 'react';
import PaymentClientPage from './PaymentClientPage';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="pt-20 text-center">Loading payment...</div>}>
      <PaymentClientPage />
    </Suspense>
  );
}
