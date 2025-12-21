import { motion } from 'framer-motion';
import { Heart, Activity, Pill, Stethoscope, Syringe, Thermometer } from 'lucide-react';

const FloatingMedicalIcons = () => {
  const icons = [
    { Icon: Heart, delay: 0, x: '10%', y: '20%' },
    { Icon: Activity, delay: 0.5, x: '80%', y: '15%' },
    { Icon: Pill, delay: 1, x: '15%', y: '70%' },
    { Icon: Stethoscope, delay: 1.5, x: '85%', y: '65%' },
    { Icon: Syringe, delay: 2, x: '50%', y: '80%' },
    { Icon: Thermometer, delay: 2.5, x: '70%', y: '40%' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Icon className="w-8 h-8 md:w-12 md:h-12 text-medical-blue-300 dark:text-medical-blue-700" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingMedicalIcons;
