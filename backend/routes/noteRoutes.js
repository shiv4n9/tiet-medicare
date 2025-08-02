import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Note from '../models/Note.js';
import NoteTemplate from '../models/NoteTemplate.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get all notes for a patient
// @route   GET /api/doctor/notes
// @access  Private (Doctor only)
const getNotes = asyncHandler(async (req, res) => {
  const { 
    patientId, 
    type, 
    status, 
    search, 
    page = 1, 
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { doctorId: req.user._id };
  
  if (patientId) query.patientId = patientId;
  if (type) query.type = type;
  if (status) query.status = status;
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [notes, total] = await Promise.all([
    Note.find(query)
      .populate('patientId', 'name age gender')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    Note.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: notes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get a single note by ID
// @route   GET /api/doctor/notes/:id
// @access  Private (Doctor only)
const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate('patientId', 'name age gender')
    .populate('doctorId', 'name specialty')
    .populate('previousVersions', 'title content version createdAt');

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Verify the requesting doctor has access to this note
  if (note.doctorId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this note');
  }

  res.json({
    success: true,
    data: note
  });
});

// @desc    Create a new note
// @route   POST /api/doctor/notes
// @access  Private (Doctor only)
const createNote = asyncHandler(async (req, res) => {
  const { 
    title, 
    content, 
    patientId, 
    type, 
    appointmentId,
    tags = []
  } = req.body;

  // Validate required fields
  if (!title || !content || !patientId) {
    res.status(400);
    throw new Error('Title, content, and patient ID are required');
  }

  const note = await Note.create({
    title,
    content,
    patientId,
    doctorId: req.user._id,
    appointmentId,
    type: type || 'general',
    tags,
    metadata: {
      createdBy: req.user._id
    }
  });

  res.status(201).json({
    success: true,
    data: await note.populate('patientId', 'name age gender')
  });
});

// @desc    Update a note
// @route   PUT /api/doctor/notes/:id
// @access  Private (Doctor only)
const updateNote = asyncHandler(async (req, res) => {
  const { 
    title, 
    content, 
    status, 
    tags,
    createNewVersion = false
  } = req.body;

  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Verify the requesting doctor has access to this note
  if (note.doctorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this note');
  }

  // Create a new version if requested and content is being modified
  if (createNewVersion && content && content !== note.content) {
    const newVersion = await note.createNewVersion(req.user._id);
    
    // Update the current note with new content
    note.content = content;
    if (title) note.title = title;
    if (status) note.status = status;
    if (tags) note.tags = tags;
    
    // Update metadata
    note.metadata.lastModified = new Date();
    note.metadata.modifiedBy = req.user._id;
    note.version += 1;
    
    await note.save();
    
    return res.json({
      success: true,
      data: await Note.findById(note._id)
        .populate('patientId', 'name age gender')
        .populate('previousVersions', 'title content version createdAt')
    });
  }

  // Otherwise, update the note directly
  if (title) note.title = title;
  if (content) note.content = content;
  if (status) note.status = status;
  if (tags) note.tags = tags;
  
  // Update metadata
  note.metadata.lastModified = new Date();
  note.metadata.modifiedBy = req.user._id;
  
  await note.save();

  res.json({
    success: true,
    data: await Note.findById(note._id)
      .populate('patientId', 'name age gender')
      .populate('previousVersions', 'title content version createdAt')
  });
});

// @desc    Delete a note
// @route   DELETE /api/doctor/notes/:id
// @access  Private (Doctor only)
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Verify the requesting doctor has access to this note
  if (note.doctorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this note');
  }

  // Soft delete by marking as inactive
  note.isActive = false;
  await note.save();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Sign a note
// @route   POST /api/doctor/notes/:id/sign
// @access  Private (Doctor only)
const signNote = asyncHandler(async (req, res) => {
  const { signature, title } = req.body;

  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Verify the requesting doctor has access to this note
  if (note.doctorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to sign this note');
  }

  // Update note with signature
  note.signedBy = {
    user: req.user._id,
    name: req.user.name,
    title: title || 'Dr.',
    signature,
    signedAt: new Date()
  };
  
  note.status = 'signed';
  note.metadata.lastModified = new Date();
  note.metadata.modifiedBy = req.user._id;
  
  await note.save();

  res.json({
    success: true,
    data: await Note.findById(note._id)
      .populate('patientId', 'name age gender')
  });
});

// @desc    Get all note templates
// @route   GET /api/doctor/note-templates
// @access  Private (Doctor only)
const getNoteTemplates = asyncHandler(async (req, res) => {
  const { 
    type, 
    specialty, 
    search, 
    isPublic,
    page = 1, 
    limit = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;
  
  const query = { 
    $or: [
      { createdBy: req.user._id },
      { isPublic: true }
    ]
  };
  
  if (type) query.type = type;
  if (specialty) query.specialty = specialty;
  if (isPublic !== undefined) query.isPublic = isPublic === 'true';
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [templates, total] = await Promise.all([
    NoteTemplate.find(query)
      .populate('createdBy', 'name')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    NoteTemplate.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: templates,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Create a new note template
// @route   POST /api/doctor/note-templates
// @access  Private (Doctor only)
const createNoteTemplate = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    content, 
    type, 
    specialty, 
    tags = [],
    isPublic = false,
    variables = [],
    sections = []
  } = req.body;

  // Validate required fields
  if (!name || !content) {
    res.status(400);
    throw new Error('Name and content are required');
  }

  const template = await NoteTemplate.create({
    name,
    description,
    content,
    type: type || 'general',
    specialty,
    tags,
    isPublic,
    variables,
    sections,
    createdBy: req.user._id,
    metadata: {
      createdBy: req.user._id,
      lastModified: new Date()
    }
  });

  res.status(201).json({
    success: true,
    data: template
  });
});

// @desc    Create a note from a template
// @route   POST /api/doctor/notes/from-template
// @access  Private (Doctor only)
const createNoteFromTemplate = asyncHandler(async (req, res) => {
  const { templateId, patientId, variables = {}, appointmentId } = req.body;

  const template = await NoteTemplate.findById(templateId);
  
  if (!template) {
    res.status(404);
    throw new Error('Template not found');
  }

  // Check if template is public or created by the user
  if (!template.isPublic && template.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to use this template');
  }

  // Create note from template
  const noteData = template.createNote(req.user._id, patientId, variables);
  noteData.appointmentId = appointmentId;
  
  const note = await Note.create(noteData);
  
  // Increment template usage count
  await template.incrementUsage();

  res.status(201).json({
    success: true,
    data: await note.populate('patientId', 'name age gender')
  });
});

// @desc    Get note drafts
// @route   GET /api/doctor/note-drafts
// @access  Private (Doctor only)
const getNoteDrafts = asyncHandler(async (req, res) => {
  const { 
    patientId, 
    type, 
    page = 1, 
    limit = 10 
  } = req.query;
  
  const query = { 
    doctorId: req.user._id,
    status: 'draft'
  };
  
  if (patientId) query.patientId = patientId;
  if (type) query.type = type;

  const [drafts, total] = await Promise.all([
    Note.find(query)
      .populate('patientId', 'name age gender')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    Note.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: drafts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Apply authentication middleware to all routes
router.use(protect);

// Note routes
router.get('/notes', getNotes);
router.get('/notes/:id', getNote);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);
router.post('/notes/:id/sign', signNote);

// Note template routes
router.get('/note-templates', getNoteTemplates);
router.post('/note-templates', createNoteTemplate);

// Special routes
router.post('/notes/from-template', createNoteFromTemplate);
router.get('/note-drafts', getNoteDrafts);

export default router;
