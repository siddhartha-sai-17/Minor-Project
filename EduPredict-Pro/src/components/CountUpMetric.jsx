import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function CountUpMetric({ 
  value, 
  prefix = "", 
  suffix = "", 
  duration = 1.5, 
  className = "" 
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      ease: "easeOut",
      delay: 0.1
    });

    return controls.stop;
  }, [value, count, duration]);

  useEffect(() => {
    return rounded.onChange(v => setDisplayValue(v));
  }, [rounded]);

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
