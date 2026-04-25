// Shared framer-motion variants used across panels.
import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const cardEnter: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
};
