
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute w-full h-full">
        {/* Light mode particles */}
        <div className="hidden dark:block">
          {Array.from({ length: 15 }).map((_, index) => (
            <motion.div
              key={`dark-particle-${index}`}
              className="absolute rounded-full bg-white/5 backdrop-blur-md"
              style={{
                width: Math.random() * 150 + 50,
                height: Math.random() * 150 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 20 - 10],
                y: [0, Math.random() * 20 - 10],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
        
        {/* Dark mode glowing orbs */}
        <div className="dark:hidden">
          {Array.from({ length: 15 }).map((_, index) => (
            <motion.div
              key={`light-particle-${index}`}
              className="absolute rounded-full"
              style={{
                background: index % 2 === 0 
                  ? 'radial-gradient(circle, rgba(0,194,255,0.15) 0%, rgba(0,194,255,0) 70%)'
                  : 'radial-gradient(circle, rgba(0,255,179,0.1) 0%, rgba(0,255,179,0) 70%)',
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                x: [0, Math.random() * 30 - 15],
                y: [0, Math.random() * 30 - 15],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
