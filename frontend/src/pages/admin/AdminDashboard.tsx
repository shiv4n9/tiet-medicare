import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Search, UserPlus, UserCheck, UserX, Users, Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import adminService, { User } from '@/services/adminService';
import Breadcrumb from '@/components/Breadcrumb';

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    doctors: number;
    patients: number;
    admins: number;
    newUsersLast7Days: number;
    newUsersLast30Days: number;
  } | null>(null);

  // Memoized fetch functions to prevent infinite re-renders
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const statusFilterValue = statusFilter === '' ? null : statusFilter;
      const roleFilterValue = roleFilter === 'all' ? '' : roleFilter;
      const { data, pagination: paginationData } = await adminService.getUsers(
        pagination.page,
        pagination.limit,
        searchTerm,
        roleFilterValue,
        statusFilterValue
      );
      setUsers(data);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total,
        totalPages: paginationData.totalPages,
        hasNext: paginationData.hasNext,
        hasPrev: paginationData.hasPrev,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error?.message || 'Failed to load users';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, roleFilter, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await adminService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    }
  }, []);

  // Auth check effect
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Fetch data when authenticated and authorized
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [isAuthenticated, user, fetchUsers, fetchStats]);
  
  // Reset to first page when filters change (but not on initial load)
  useEffect(() => {
    if (pagination.page !== 1 && (searchTerm || roleFilter !== 'all' || statusFilter !== '')) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [searchTerm, roleFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const updateUserRole = async (userId: string, newRole: string, newSpecialization?: string) => {
    if (!userId || !newRole) return;
    
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      
      const updatedUser = await adminService.updateUserRole(
        userId, 
        newRole as 'patient' | 'doctor' | 'admin',
        newRole === 'doctor' ? newSpecialization || 'General Medicine' : undefined
      );
      
      // Update local state
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === userId ? updatedUser : user
      ));
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      const errorMessage = error?.message || 'Failed to update user role';
      toast.error(errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!userId) return;
    
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      
      const updatedUser = await adminService.toggleUserStatus(userId, !currentStatus);
      
      // Update local state
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === userId ? updatedUser : user
      ));
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage = error?.message || 'Failed to update user status';
      toast.error(errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleSpecializationUpdate = (userId: string, specialization: string) => {
    setUsers(prevUsers => prevUsers.map(u => 
      u._id === userId 
        ? { ...u, specialization: specialization } 
        : u
    ));
  };

  const handleSpecializationSave = (userId: string, role: string, specialization?: string) => {
    updateUserRole(userId, role, specialization);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Unauthorized access
  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect via useEffect
  }

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
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage users, roles, and system settings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  onClick={() => navigate('/doctor')}
                  className="text-sm bg-medical-blue-100 hover:bg-medical-blue-200 text-medical-blue-700 dark:bg-medical-blue-800 dark:hover:bg-medical-blue-700 dark:text-medical-blue-200"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Doctor View
                </Button>
                <Button 
                  onClick={() => navigate('/patient')}
                  className="text-sm bg-medical-green-100 hover:bg-medical-green-200 text-medical-green-700 dark:bg-medical-green-800 dark:hover:bg-medical-green-700 dark:text-medical-green-200"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Patient View
                </Button>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Profile
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.doctors || 0} doctors • {stats?.patients || 0} patients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.inactiveUsers || 0} inactive users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">New Users (7d)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.newUsersLast7Days || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.newUsersLast30Days || 0} new in 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.admins || 0}</div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-4">
              <div>
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription>
                  View and manage all users, roles, and account statuses
                </CardDescription>
              </div>
              <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="relative">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select 
                value={roleFilter} 
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={statusFilter === '' ? 'all' : String(statusFilter)}
                onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value === 'true')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              {(roleFilter !== 'all' || statusFilter !== '') && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('');
                  }}
                  className="text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user._id, value, user.specialization)}
                            disabled={updating[user._id]}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="patient">Patient</SelectItem>
                              <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.role === 'doctor' ? (
                            <Input
                              type="text"
                              value={user.specialization || ''}
                              onChange={(e) => handleSpecializationUpdate(user._id, e.target.value)}
                              onBlur={() => handleSpecializationSave(user._id, user.role, user.specialization)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSpecializationSave(user._id, user.role, user.specialization);
                                }
                              }}
                              disabled={updating[user._id]}
                              className="w-48"
                              placeholder="Enter specialization"
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={user.isActive ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            disabled={updating[user._id]}
                          >
                            {updating[user._id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.isActive ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;