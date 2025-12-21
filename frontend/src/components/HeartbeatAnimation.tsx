import { motion } from 'framer-motion';

const HeartbeatAnimation = () => {
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        },
        opacity: {
          duration: 0.5,
        },
      },
    },
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 dark:opacity-10">
      <svg
        width="100%"
        height="200"
        viewBox="0 0 800 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-4xl"
      >
        <motion.path
          d="M 0 100 L 100 100 L 120 80 L 140 120 L 160 60 L 180 140 L 200 100 L 800 100"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HeartbeatAnimation;
