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
  FileText, 
  Mic, 
  Search, 
  Filter,
  Download,
  Eye,
  Plus,
  Save,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Note {
  _id: string;
  patientId: string;
  patientName: string;
  type: 'soap' | 'progress' | 'consultation' | 'procedure';
  title: string;
  content: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  icd10Codes: string[];
  createdDate: string;
  lastModified: string;
  status: 'draft' | 'completed' | 'reviewed';
  tags: string[];
}

interface Template {
  _id: string;
  name: string;
  type: 'soap' | 'progress' | 'consultation' | 'procedure';
  content: string;
  icd10Codes: string[];
  tags: string[];
}

const DocumentationNotes: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'templates' | 'drafts'>('notes');
  const [isRecording, setIsRecording] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: () => doctorService.getNotes?.() || Promise.resolve([]),
  });

  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ['noteTemplates'],
    queryFn: () => doctorService.getNoteTemplates?.() || Promise.resolve([]),
  });

  const { data: drafts, isLoading: draftsLoading } = useQuery<Note[]>({
    queryKey: ['noteDrafts'],
    queryFn: () => doctorService.getNoteDrafts?.() || Promise.resolve([]),
  });

  const saveNoteMutation = useMutation({
    mutationFn: (noteData: any) => doctorService.saveNote?.(noteData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['noteDrafts'] });
    },
  });

  const createNoteFromTemplateMutation = useMutation({
    mutationFn: (data: { templateId: string; patientId: string }) => 
      doctorService.createNoteFromTemplate?.(data) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  if (notesLoading || templatesLoading || draftsLoading) return <div>Loading documentation data...</div>;

  const allNotes = notes || [];
  const allTemplates = templates || [];
  const allDrafts = drafts || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'soap':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'consultation':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'procedure':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSaveNote = (noteData: any) => {
    saveNoteMutation.mutate(noteData);
  };

  const handleCreateFromTemplate = (template: Template) => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    createNoteFromTemplateMutation.mutate({
      templateId: template._id,
      patientId: selectedPatient
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would integrate with speech-to-text API
    console.log('Recording toggled:', !isRecording);
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
                <FileText className="w-5 h-5 text-medical-blue-600" />
                Documentation & Notes
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant={isRecording ? 'destructive' : 'outline'}
                  onClick={toggleRecording}
                >
                  <Mic className="w-4 h-4 mr-1" />
                  {isRecording ? 'Stop' : 'Voice'}
                </Button>
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
                variant={activeTab === 'notes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('notes')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Notes ({allNotes.length})
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('templates')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Templates ({allTemplates.length})
              </Button>
              <Button
                variant={activeTab === 'drafts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('drafts')}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-1" />
                Drafts ({allDrafts.length})
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
                  placeholder="Search notes, templates, or patients..."
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
      {activeTab === 'notes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-green-600" />
                Patient Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allNotes.map((note) => (
                    <div key={note._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                            {note.patientName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{note.title}</h4>
                            <Badge className={getStatusColor(note.status)}>
                              {note.status}
                            </Badge>
                            <Badge className={getTypeColor(note.type)}>
                              {note.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {note.content.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Patient: {note.patientName} • Created: {new Date(note.createdDate).toLocaleDateString()}
                          </p>
                          {note.icd10Codes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {note.icd10Codes.slice(0, 3).map((code, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                              {note.icd10Codes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.icd10Codes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Export
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
                <FileText className="w-5 h-5 text-medical-purple-600" />
                Note Templates
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
                          <Badge className={getTypeColor(template.type)}>
                            {template.type.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {template.content.substring(0, 150)}...
                          </p>
                          {template.icd10Codes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.icd10Codes.slice(0, 3).map((code, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {template.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateFromTemplate(template)}
                          disabled={!selectedPatient}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Use
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

      {/* Quick Note Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-medical-orange-600" />
              Quick Note Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <Input placeholder="Select patient..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note Type</label>
                <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                  <option value="soap">SOAP Note</option>
                  <option value="progress">Progress Note</option>
                  <option value="consultation">Consultation Note</option>
                  <option value="procedure">Procedure Note</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <Input placeholder="Note title..." className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                <Textarea placeholder="Start typing or use voice input..." className="mt-1 h-32" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ICD-10 Codes</label>
                <Input placeholder="Search ICD-10 codes..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                <Input placeholder="Add tags..." className="mt-1" />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Save className="w-4 h-4 mr-1" />
                  Save Draft
                </Button>
                <Button className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DocumentationNotes; 