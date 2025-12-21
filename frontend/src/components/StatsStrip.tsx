import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Users, Star, TrendingUp, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalAppointments?: number;
  totalPatients?: number;
  totalDoctors?: number;
  averageRating?: number;
  responseTime?: string;
  satisfactionRate?: number;
}

const StatsStrip = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Fetch real stats from backend
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stats/dashboard`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Only show if we have valid data
  const hasValidData = stats && (
    stats.totalAppointments || 
    stats.totalPatients || 
    stats.totalDoctors || 
    stats.averageRating || 
    stats.satisfactionRate
  );

  if (isLoading || !hasValidData) {
    return null;
  }

  const statsData = [
    {
      icon: Activity,
      value: stats.totalAppointments ? `${stats.totalAppointments.toLocaleString()}+` : null,
      label: 'Appointments',
      color: 'text-medical-blue-600 dark:text-medical-blue-400',
      bgColor: 'bg-medical-blue-50 dark:bg-medical-blue-900/20',
    },
    {
      icon: Clock,
      value: stats.responseTime || '24/7',
      label: 'Response Time',
      color: 'text-medical-green-600 dark:text-medical-green-400',
      bgColor: 'bg-medical-green-50 dark:bg-medical-green-900/20',
    },
    {
      icon: Users,
      value: stats.totalPatients ? `${stats.totalPatients.toLocaleString()}+` : null,
      label: 'Active Patients',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Star,
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : null,
      label: 'Average Rating',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      icon: Heart,
      value: stats.satisfactionRate ? `${stats.satisfactionRate}%` : null,
      label: 'User Satisfaction',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: TrendingUp,
      value: stats.totalDoctors ? `${stats.totalDoctors}+` : null,
      label: 'Medical Professionals',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ].filter(stat => stat.value !== null); // Only show stats with values

  if (statsData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative -mt-10 mb-16 z-10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-gray-200 dark:divide-gray-700">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  >
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsStrip;
