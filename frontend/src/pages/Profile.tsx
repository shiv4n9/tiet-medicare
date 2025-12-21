import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Calendar,
  Shield,
  FileText,
  Heart,
  Activity,
  Clock,
  Loader2,
  Edit3,
  Save,
  X,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  authProvider?: 'email' | 'google';
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

// Generate random avatar URL based on user name
const getAvatarUrl = (name: string) => {
  const styles = ['adventurer', 'avataaars', 'big-ears', 'bottts', 'croodles', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'personas'];
  const style = styles[Math.floor(name.length % styles.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}`;
};

const Profile: React.FC = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const profile = await authService.getProfile() as UserProfile;
        setUserProfile(profile);
        setEditForm({
          name: profile.name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || '',
          bloodGroup: profile.bloodGroup || '',
          emergencyContact: profile.emergencyContact || ''
        });
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(editForm);
      setUserProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        gender: userProfile.gender || '',
        bloodGroup: userProfile.bloodGroup || '',
        emergencyContact: userProfile.emergencyContact || ''
      });
    }
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">You must be logged in to view your profile.</p>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMemberSince = () => {
    if (!userProfile?.createdAt) return 'N/A';
    return new Date(userProfile.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getLastLogin = () => {
    if (!userProfile?.lastLogin) return 'Never';
    return formatDate(userProfile.lastLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-blue-100 mt-2">Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 -mt-4">
        {loading ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : userProfile ? (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                      <AvatarImage 
                        src={getAvatarUrl(userProfile.name)} 
                        alt={userProfile.name} 
                      />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-green-500 text-white">
                        {userProfile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
                      <div className="flex gap-2 justify-center md:justify-start">
                        <Badge className="bg-blue-100 text-blue-800">
                          {userProfile.role?.charAt(0).toUpperCase() + userProfile.role?.slice(1) || 'Patient'}
                        </Badge>
                        {userProfile.isActive && (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-4 h-4" />
                        {userProfile.email}
                      </p>
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <Calendar className="w-4 h-4" />
                        Member since {getMemberSince()}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div>
                    {!isEditing ? (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save
                        </Button>
                        <Button 
                          onClick={handleCancelEdit}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <Label className="text-gray-600">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">{userProfile.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="text-gray-600">Email Address</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{userProfile.email}</p>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-gray-600">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userProfile.phone || <span className="text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Label className="text-gray-600">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userProfile.dateOfBirth ? formatDate(userProfile.dateOfBirth) : <span className="text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <Label className="text-gray-600">Gender</Label>
                    {isEditing ? (
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userProfile.gender || <span className="text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <Label className="text-gray-600">Blood Group</Label>
                    {isEditing ? (
                      <select
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userProfile.bloodGroup || <span className="text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <Label className="text-gray-600">Address</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Enter your address"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userProfile.address || <span className="text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="md:col-span-2">
                    <Label className="text-gray-600">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        placeholder="Emergency contact number"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userProfile.emergencyContact || <span className="text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Status</p>
                      <p className="text-xl font-bold text-gray-900">
                        {userProfile.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="text-lg font-bold text-gray-900">{getLastLogin()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Auth Provider</p>
                      <p className="text-lg font-bold text-gray-900">
                        {userProfile.authProvider === 'google' ? 'Google' : 'Email'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProfile.role === 'doctor' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/doctor')}
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50"
                    >
                      <Activity className="w-6 h-6 text-blue-600" />
                      <span className="text-sm">Dashboard</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/#appointments')}
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50"
                    >
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <span className="text-sm">Book Appointment</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/patient')}
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50"
                    >
                      <FileText className="w-6 h-6 text-green-600" />
                      <span className="text-sm">View Records</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
