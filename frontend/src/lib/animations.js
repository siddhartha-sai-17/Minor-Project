// ─────────────────────────────────────────────────────────────
// EduPredict — Framer Motion Animation Variants
// Central library: import from here everywhere
// ─────────────────────────────────────────────────────────────

// ── Page Transitions ──────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

// ── Card Entrance ─────────────────────────────────────────────
export const cardVariants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Hover Lift ────────────────────────────────────────────────
export const hoverLift = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 30px rgba(79,70,229,0.12), 0 4px 12px rgba(0,0,0,0.06)',
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  },
};

// ── Stagger Container ─────────────────────────────────────────
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// ── Stagger Item (used inside staggerContainer) ───────────────
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Slide Horizontal (form steps) ────────────────────────────
export const slideHorizontal = (dir = 1) => ({
  initial: { opacity: 0, x: dir * 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: dir * -40,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
});

// ── Fade In ───────────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ── Scale Pop (badges, counters) ──────────────────────────────
export const scalePop = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 22 },
  },
};

// ── Press Scale (buttons) ─────────────────────────────────────
export const pressScale = { whileTap: { scale: 0.96 } };

// ── Shake (error feedback) ────────────────────────────────────
export const shakeVariant = {
  shake: {
    x: [-6, 6, -5, 5, -3, 3, 0],
    transition: { duration: 0.45 },
  },
};

// ── Spring config presets ─────────────────────────────────────
export const springSmooth = { type: 'spring', stiffness: 280, damping: 30 };
export const springSnappy = { type: 'spring', stiffness: 420, damping: 26 };
export const springBouncy = { type: 'spring', stiffness: 320, damping: 18 };

// ── Table row stagger ─────────────────────────────────────────
export const tableRowVariants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
};
