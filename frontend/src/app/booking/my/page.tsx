'use client';

import { Suspense } from 'react';
import BookingConfirmContent from './BookingConfirmContent';

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={<div className="pt-20 text-center">Loading...</div>}>
      <BookingConfirmContent />
    </Suspense>
  );
}
