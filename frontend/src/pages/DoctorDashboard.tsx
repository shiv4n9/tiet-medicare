import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { 
  Calendar, 
  Users, 
  Activity, 
  Bell, 
  Search, 
  FileText, 
  MessageSquare,
  TestTube,
  Pill,
  Stethoscope,
  Settings,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Phone,
  Video,
  Mail,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Breadcrumb from '@/components/Breadcrumb';

// Dashboard Components
import PatientOverviewPanel from '@/components/doctor/PatientOverviewPanel';
import PatientSearch from '@/components/doctor/PatientSearch';
import TodaySchedule from '@/components/doctor/TodaySchedule';
import AnalyticsKPIs from '@/components/doctor/AnalyticsKPIs';

const DoctorDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard overview data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['doctorDashboardOverview'],
    queryFn: doctorService.getDashboardOverview,
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'doctor')) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  const dashboardTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ehr', label: 'EHR', icon: FileText },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'labs', label: 'Labs', icon: TestTube },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'referrals', label: 'Referrals', icon: Stethoscope },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 bg-medical-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
              </Button>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Doctor Dashboard
                </h1>
                <Badge className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                  {user?.specialization || 'General Medicine'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  onClick={() => navigate('/my-appointments')}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  My Appointments
                </Button>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                {user?.role === 'doctor' && (
                  <Button 
                    onClick={() => navigate('/admin')}
                    className="text-sm bg-medical-green-100 hover:bg-medical-green-200 text-medical-green-700 dark:bg-medical-green-800 dark:hover:bg-medical-green-700 dark:text-medical-green-200"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                    {user?.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-medical-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardLoading ? '...' : (dashboardData?.todayAppointments?.length || 0)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-medical-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-medical-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients Seen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardLoading ? '...' : (dashboardData?.recentPatients?.length || 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-medical-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-medical-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardLoading ? '...' : (dashboardData?.weeklyStats?.totalAppointments || 0)}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-medical-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardLoading ? '...' : (dashboardData?.criticalAlerts?.length || 0)}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:grid-cols-13 h-auto p-1 bg-gray-100 dark:bg-gray-800">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center space-y-1 px-3 py-2 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PatientOverviewPanel />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-medical-blue-600" />
                      Recent Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData?.criticalAlerts?.length > 0 ? (
                        dashboardData.criticalAlerts.map((alert: any) => (
                          <div key={alert._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No notifications</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientSearch />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <TodaySchedule />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsKPIs />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.criticalAlerts?.length > 0 ? (
                    dashboardData.criticalAlerts.map((alert: any) => (
                      <div key={alert._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{alert.message}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Critical</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No notifications available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ehr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Electronic Health Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  EHR functionality coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Communication features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lab Orders & Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Lab management features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Prescription features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Documentation features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Referral features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Profile Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name: {user?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user?.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Specialization: {user?.specialization || 'General Medicine'}</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Update Profile</Button>
                        <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Manage Availability</Button>
                        <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">View Reports</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Compliance monitoring features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard; 