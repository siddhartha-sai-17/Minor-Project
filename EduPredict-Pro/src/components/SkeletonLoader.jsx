import React from 'react';
import { motion } from 'framer-motion';

export const ShimmerItem = ({ className = "" }) => (
  <div className={`shimmer rounded-lg ${className}`} />
);

export default function SkeletonLoader({ type = "card" }) {
  if (type === "card") {
    return (
      <div className="glass-card p-6 min-h-[160px] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ShimmerItem className="w-10 h-10 rounded-xl" />
          <ShimmerItem className="w-24 h-4" />
        </div>
        <ShimmerItem className="w-full h-8" />
        <div className="flex gap-2">
          <ShimmerItem className="w-16 h-4 rounded-full" />
          <ShimmerItem className="w-20 h-4 rounded-full" />
        </div>
      </div>
    );
  }

  if (type === "metric") {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <ShimmerItem className="w-24 h-24 rounded-full mb-3" />
        <ShimmerItem className="w-12 h-4 mb-1" />
        <ShimmerItem className="w-20 h-2" />
      </div>
    );
  }

  if (type === "table-row") {
    return (
      <div className="flex items-center gap-4 py-4 px-6 border-b border-slate-50">
        <ShimmerItem className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <ShimmerItem className="w-[40%] h-4" />
          <ShimmerItem className="w-[20%] h-3" />
        </div>
        <ShimmerItem className="w-24 h-8 rounded-lg" />
      </div>
    );
  }

  return <ShimmerItem className="w-full h-20" />;
}
