import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Save,
  Calendar,
  User,
  Bell,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComplianceAlert {
  _id: string;
  type: 'medicare_update' | 'audit_trail' | 'data_compliance' | 'security' | 'regulatory';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  dueDate?: string;
  createdDate: string;
  actionRequired: boolean;
  actionUrl?: string;
}

interface AuditTrail {
  _id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

interface ComplianceReport {
  _id: string;
  period: string;
  complianceScore: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  recommendations: string[];
  generatedDate: string;
}

const ComplianceAlerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'audit' | 'reports'>('alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: alerts, isLoading: alertsLoading } = useQuery<ComplianceAlert[]>({
    queryKey: ['complianceAlerts'],
    queryFn: () => doctorService.getComplianceAlerts?.() || Promise.resolve([]),
  });

  const { data: auditTrail, isLoading: auditLoading } = useQuery<AuditTrail[]>({
    queryKey: ['auditTrail'],
    queryFn: () => doctorService.getAuditTrail?.() || Promise.resolve([]),
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<ComplianceReport[]>({
    queryKey: ['complianceReports'],
    queryFn: () => doctorService.getComplianceReports?.() || Promise.resolve([]),
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: string) => doctorService.acknowledgeAlert?.(alertId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceAlerts'] });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => doctorService.resolveAlert?.(alertId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceAlerts'] });
    },
  });

  if (alertsLoading || auditLoading || reportsLoading) return <div>Loading compliance data...</div>;

  const allAlerts = alerts || [];
  const allAuditTrail = auditTrail || [];
  const allReports = reports || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medicare_update':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'audit_trail':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'data_compliance':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'regulatory':
        return <Bell className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlertMutation.mutate(alertId);
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
                <Shield className="w-5 h-5 text-medical-blue-600" />
                Compliance & Alerts
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'alerts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('alerts')}
                className="flex-1"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Alerts ({allAlerts.filter(a => a.status === 'active').length})
              </Button>
              <Button
                variant={activeTab === 'audit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('audit')}
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-1" />
                Audit Trail ({allAuditTrail.length})
              </Button>
              <Button
                variant={activeTab === 'reports' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('reports')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Reports ({allReports.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search alerts, audit entries, or reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 'alerts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-medical-red-600" />
                Compliance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allAlerts.map((alert) => (
                    <div key={alert._id} className={`p-4 border rounded-lg ${
                      alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                      alert.severity === 'high' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' :
                      'border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getTypeIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                              {alert.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Created: {new Date(alert.createdDate).toLocaleDateString()}
                              </span>
                              {alert.dueDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Due: {new Date(alert.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.actionRequired && alert.status === 'active' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAcknowledgeAlert(alert._id)}
                              disabled={acknowledgeAlertMutation.isPending}
                            >
                              Acknowledge
                            </Button>
                          )}
                          {alert.status === 'acknowledged' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleResolveAlert(alert._id)}
                              disabled={resolveAlertMutation.isPending}
                            >
                              Resolve
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'audit' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-medical-purple-600" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allAuditTrail.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200 text-xs">
                            {entry.userName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{entry.action}</h4>
                            <Badge variant="outline" className="text-xs">
                              {entry.userName}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.details}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()} • IP: {entry.ipAddress}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-green-600" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allReports.map((report) => (
                    <div key={report._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Compliance Report - {report.period}
                            </h4>
                            <Badge variant={report.complianceScore >= 90 ? 'outline' : 'destructive'}>
                              {report.complianceScore}% Compliant
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{report.passedChecks}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Passed</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{report.failedChecks}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{report.totalChecks}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            </div>
                          </div>
                          {report.recommendations.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendations:</p>
                              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                {report.recommendations.slice(0, 3).map((rec, index) => (
                                  <li key={index}>• {rec}</li>
                                ))}
                                {report.recommendations.length > 3 && (
                                  <li>• +{report.recommendations.length - 3} more recommendations</li>
                                )}
                              </ul>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Generated: {new Date(report.generatedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Compliance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-medical-orange-600" />
              Compliance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {allAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {allAlerts.filter(a => a.actionRequired && a.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Action Required</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {allReports.length > 0 ? Math.round(allReports[0].complianceScore) : 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {allAuditTrail.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Audit Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ComplianceAlerts; 