import { motion } from 'framer-motion';
import { pageVariants } from '../lib/animations';

/**
 * AnimatedPageWrapper
 * Wrap every page's root element with this to get consistent
 * fade + slide-up page transitions.
 *
 * Usage:
 *   <AnimatedPageWrapper>
 *     ...page content...
 *   </AnimatedPageWrapper>
 */
export default function AnimatedPageWrapper({ children, className = '', style = {} }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
