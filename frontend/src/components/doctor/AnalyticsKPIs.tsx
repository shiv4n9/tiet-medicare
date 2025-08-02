import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { motion } from 'framer-motion';

interface KPI {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  noShows: number;
  noShowRate: number;
  completionRate: number;
  avgConsultationTime?: number;
  totalPatients?: number;
  prescriptionsIssued?: number;
}

const AnalyticsKPIs: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');

  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timePeriod],
    queryFn: () => doctorService.getAnalytics(timePeriod),
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics</div>;

  const data = analyticsData || {
    totalAppointments: 0,
    completedAppointments: 0,
    noShows: 0,
    noShowRate: 0,
    completionRate: 0,
    avgConsultationTime: 0,
    totalPatients: 0,
    prescriptionsIssued: 0
  };

  const kpis: KPI[] = [
    {
      title: 'Patients Seen',
      value: data.totalPatients || data.completedAppointments,
      change: 12.5,
      changeType: 'increase',
      icon: <Users className="w-6 h-6" />,
      color: 'text-medical-blue-600'
    },
    {
      title: 'No-Show Rate',
      value: `${data.noShowRate}%`,
      change: 2.1,
      changeType: 'decrease',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'text-medical-green-600'
    },
    {
      title: 'Avg. Consultation Time',
      value: `${data.avgConsultationTime || 24} min`,
      change: 3.2,
      changeType: 'increase',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-medical-orange-600'
    },
    {
      title: 'Prescriptions Issued',
      value: data.prescriptionsIssued || 89,
      change: 15.3,
      changeType: 'increase',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-medical-purple-600'
    }
  ];

  const prescriptionTrends: ChartData[] = [
    { name: 'Antibiotics', value: 25, color: '#3B82F6' },
    { name: 'Pain Relief', value: 20, color: '#EF4444' },
    { name: 'Cardiovascular', value: 18, color: '#10B981' },
    { name: 'Diabetes', value: 15, color: '#F59E0B' },
    { name: 'Others', value: 22, color: '#8B5CF6' }
  ];

  const consultationTimes = [
    { day: 'Mon', time: 22 },
    { day: 'Tue', time: 28 },
    { day: 'Wed', time: 25 },
    { day: 'Thu', time: 30 },
    { day: 'Fri', time: 26 },
    { day: 'Sat', time: 20 },
    { day: 'Sun', time: 15 }
  ];

  const getChangeColor = (changeType: string) => {
    return changeType === 'increase' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = (changeType: string) => {
    return changeType === 'increase' 
      ? <TrendingUp className="w-4 h-4" />
      : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-medical-blue-600" />
                Analytics & KPIs
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={timePeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('week')}
                >
                  Week
                </Button>
                <Button
                  variant={timePeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('month')}
                >
                  Month
                </Button>
                <Button
                  variant={timePeriod === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('year')}
                >
                  Year
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getChangeIcon(kpi.changeType)}
                      <span className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                        {kpi.change}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        vs last {timePeriod}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-medical-purple-600" />
                Prescription Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionTrends.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(item.value / 100) * 100}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consultation Time Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-medical-blue-600" />
                Consultation Time Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Average: {data.avgConsultationTime || 24.5} minutes</span>
                  <span>Target: 20 minutes</span>
                </div>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {consultationTimes.map((day, index) => (
                    <div key={day.day} className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        <div
                          className="w-8 rounded-t transition-all duration-500 bg-medical-blue-500 hover:bg-medical-blue-600"
                          style={{ height: `${(day.time / 30) * 100}px` }}
                        ></div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
                          {day.day}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-medical-green-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Patient Satisfaction
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    94.2%
                  </span>
                </div>
                <Progress value={94.2} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Appointment Completion
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {data.completionRate}%
                  </span>
                </div>
                <Progress value={data.completionRate} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documentation Compliance
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    96.5%
                  </span>
                </div>
                <Progress value={96.5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-orange-600" />
              Summary Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-medical-blue-50 dark:bg-medical-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-medical-blue-600 dark:text-medical-blue-400">{data.totalPatients || 156}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
              </div>
              <div className="text-center p-4 bg-medical-green-50 dark:bg-medical-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-medical-green-600 dark:text-medical-green-400">{data.prescriptionsIssued || 89}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prescriptions</p>
              </div>
              <div className="text-center p-4 bg-medical-orange-50 dark:bg-medical-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-medical-orange-600 dark:text-medical-orange-400">{data.avgConsultationTime || 24.5}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Time (min)</p>
              </div>
              <div className="text-center p-4 bg-medical-purple-50 dark:bg-medical-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-medical-purple-600 dark:text-medical-purple-400">94.2%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsKPIs; 