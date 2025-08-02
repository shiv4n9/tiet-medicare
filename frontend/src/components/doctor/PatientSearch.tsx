import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  User, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contactNumber: string;
  email: string;
  lastVisit?: string;
  nextAppointment?: string;
  bloodGroup: string;
  medicalHistory: string;
}

const PatientSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);

  // Search patients when query changes
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['patientSearch', searchQuery],
    queryFn: () => doctorService.searchPatients(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const filteredPatients = searchResults || [];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-medical-blue-600" />
              Patient Search & Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, ID, phone, or email..."
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

      {/* Recently Accessed Patients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-medical-green-600" />
              Recently Accessed Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div key={patient._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                          {patient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            ID: {patient._id.slice(-6)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {patient.age} years • {patient.gender} • {patient.bloodGroup}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last visit: {patient.lastVisit || 'No visits'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                        {patient.nextAppointment && (
                          <Badge variant="outline" className="text-xs">
                            Next: {patient.nextAppointment}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Results */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-medical-blue-600" />
                Search Results ({filteredPatients.length})
                {searchLoading && <span className="text-sm text-gray-500">Loading...</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-medical-green-100 text-medical-green-800 dark:bg-medical-green-900 dark:text-medical-green-200">
                            {patient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              ID: {patient._id.slice(-6)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {patient.age} years • {patient.gender} • {patient.bloodGroup}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {patient.contactNumber} • {patient.email}
                          </p>
                          {patient.medicalHistory !== 'None' && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Medical History: {patient.medicalHistory}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button size="sm">
                          View Records
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
    </div>
  );
};

export default PatientSearch; 