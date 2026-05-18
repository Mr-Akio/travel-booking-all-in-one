'use client';


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
