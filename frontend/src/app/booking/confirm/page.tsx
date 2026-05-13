'use client';

import { Suspense } from 'react';
import ConfirmContent from './ConfirmContent';

export default function BookingConfirmPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center pt-20">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
