
import React, { useEffect, useRef } from 'react';

interface BlurEffectProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const BlurEffect: React.FC<BlurEffectProps> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
              entry.target.classList.remove('opacity-0');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);
  
  return (
    <div ref={elementRef} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
};

export default BlurEffect;
