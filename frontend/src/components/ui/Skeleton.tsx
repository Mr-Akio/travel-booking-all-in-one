'use client';

import { cn } from '@/lib/utils'; // Assuming you have a utils for class names, if not I will use a simple one

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cx(
        'animate-pulse rounded-md bg-slate-200',
        className
      )}
    />
  );
}

function cx(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}
