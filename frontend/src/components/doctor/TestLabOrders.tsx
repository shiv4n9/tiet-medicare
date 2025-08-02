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
  TestTube, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LabOrder {
  _id: string;
  patientId: string;
  patientName: string;
  testName: string;
  testType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  orderDate: string;
  dueDate?: string;
  completedDate?: string;
  priority: 'routine' | 'urgent' | 'stat';
  notes?: string;
  results?: any;
}

interface TestTemplate {
  _id: string;
  name: string;
  category: string;
  description: string;
  preparation: string;
  turnaroundTime: string;
  cost: number;
}

const TestLabOrders: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'templates' | 'results'>('orders');
  const queryClient = useQueryClient();

  const { data: labOrders, isLoading: ordersLoading } = useQuery<LabOrder[]>({
    queryKey: ['labOrders'],
    queryFn: () => doctorService.getLabOrders?.() || Promise.resolve([]),
  });

  const { data: testTemplates, isLoading: templatesLoading } = useQuery<TestTemplate[]>({
    queryKey: ['testTemplates'],
    queryFn: () => doctorService.getTestTemplates?.() || Promise.resolve([]),
  });

  const { data: labResults, isLoading: resultsLoading } = useQuery<any[]>({
    queryKey: ['labResults'],
    queryFn: () => doctorService.getLabResults?.() || Promise.resolve([]),
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => doctorService.createLabOrder?.(orderData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
    },
  });

  if (ordersLoading || templatesLoading || resultsLoading) return <div>Loading lab data...</div>;

  const allOrders = labOrders || [];
  const allTemplates = testTemplates || [];
  const allResults = labResults || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'routine':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreateOrder = (template: TestTemplate) => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    createOrderMutation.mutate({
      patientId: selectedPatient,
      testName: template.name,
      testType: template.category,
      priority: 'routine',
      notes: ''
    });
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
                <TestTube className="w-5 h-5 text-medical-blue-600" />
                Test & Lab Orders
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
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('orders')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Orders ({allOrders.length})
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('templates')}
                className="flex-1"
              >
                <TestTube className="w-4 h-4 mr-1" />
                Templates ({allTemplates.length})
              </Button>
              <Button
                variant={activeTab === 'results' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('results')}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Results ({allResults.length})
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
                  placeholder="Search orders, tests, or patients..."
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
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-green-600" />
                Lab Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                            {order.patientName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{order.testName}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Patient: {order.patientName} • Type: {order.testType}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ordered: {new Date(order.orderDate).toLocaleDateString()}
                            {order.dueDate && ` • Due: ${new Date(order.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Results
                          </Button>
                        )}
                        {order.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            <Send className="w-4 h-4 mr-1" />
                            Send to Lab
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-medical-purple-600" />
                Test Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allTemplates.map((template) => (
                    <div key={template._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.turnaroundTime}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ${template.cost}
                            </span>
                          </div>
                          {template.preparation && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Prep: {template.preparation}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateOrder(template)}
                          disabled={!selectedPatient}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'results' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-medical-green-600" />
                Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allResults.map((result) => (
                    <div key={result._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-medical-green-100 text-medical-green-800 dark:bg-medical-green-900 dark:text-medical-green-200">
                            {result.patientName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{result.testName}</h4>
                            <Badge variant={result.isAbnormal ? 'destructive' : 'outline'}>
                              {result.isAbnormal ? 'Abnormal' : 'Normal'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Patient: {result.patientName} • Completed: {new Date(result.completedDate).toLocaleDateString()}
                          </p>
                          {result.isAbnormal && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              ⚠️ Abnormal values detected
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Order Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-medical-orange-600" />
              Quick Order Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <Input placeholder="Select patient..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Type</label>
                <Input placeholder="Search test..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">Stat</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <Input type="date" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <Textarea placeholder="Additional notes..." className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-1" />
                  Create Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TestLabOrders; 