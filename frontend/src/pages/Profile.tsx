import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import authService from '@/services/authService';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  FileText, 
  Heart,
  Activity,
  Clock,
  MapPin,
  Loader2
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  authProvider?: 'email' | 'google';
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

const Profile: React.FC = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const profile = await authService.getProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [authUser]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You must be logged in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get member since year
  const getMemberSince = () => {
    if (!userProfile?.createdAt) return 'N/A';
    return new Date(userProfile.createdAt).getFullYear().toString();
  };

  // Get last login
  const getLastLogin = () => {
    if (!userProfile?.lastLogin) return 'Never';
    return formatDate(userProfile.lastLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Medical Theme */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Your Health Profile
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Manage your medical information and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          
          {/* Profile Header Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-8">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading profile data...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Please try refreshing the page</p>
                </div>
              ) : userProfile ? (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                    <AvatarImage src="/placeholder.svg" alt={userProfile.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {userProfile.name}
                      </h2>
                      <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                        <Shield className="w-4 h-4 mr-2" />
                        {userProfile.authProvider === 'google' ? 'Google User' : 'Email User'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{userProfile.email}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {getMemberSince()}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Last login: {getLastLogin()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {getLastLogin()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Auth Provider</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {userProfile?.authProvider === 'google' ? 'Google' : 'Email'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Heart className="w-6 h-6 text-red-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span>Book Appointment</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span>View Records</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Activity className="w-6 h-6 text-purple-600" />
                  <span>Health Metrics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  <span>Find Doctors</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="w-6 h-6 text-blue-600" />
                Account Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Profile loaded successfully</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Just now</p>
                  </div>
                </div>
                {userProfile?.lastLogin && (
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Last login</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{getLastLogin()}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Account created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{getMemberSince()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 