import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastRead: {
    type: Date,
    default: Date.now
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  leftAt: Date,
  leftReason: String,
  metadata: mongoose.Schema.Types.Mixed
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Type of conversation
  type: {
    type: String,
    enum: ['direct', 'group', 'channel', 'support', 'announcement', 'other'],
    required: true,
    default: 'direct'
  },
  // For direct messages between two users
  isDirectMessage: {
    type: Boolean,
    default: false
  },
  // Participants in the conversation
  participants: [participantSchema],
  // For group chats
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For doctor-patient conversations
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // For support conversations
  supportTicketId: String,
  supportCategory: String,
  supportPriority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Message settings
  settings: {
    isArchived: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    customNotifications: {
      type: Boolean,
      default: false
    },
    notificationSound: {
      type: String,
      default: 'default'
    },
    // For group settings
    onlyAdminsCanPost: {
      type: Boolean,
      default: false
    },
    onlyAdminsCanEdit: {
      type: Boolean,
      default: false
    },
    // Message retention policy
    messageRetention: {
      type: String,
      enum: ['forever', '24h', '7d', '30d', 'custom'],
      default: 'forever'
    },
    retentionDays: {
      type: Number,
      min: 1,
      max: 3650 // ~10 years
    },
    // End-to-end encryption
    isEncrypted: {
      type: Boolean,
      default: false
    },
    encryptionKey: String
  },
  // Last message info for preview
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: Date,
  lastMessagePreview: String,
  // Unread message count by user
  unreadCounts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  // For search and organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Metadata
  metadata: {
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // For analytics
    messageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    participantCount: {
      type: Number,
      default: 0,
      min: 0
    },
    // For custom fields
    customFields: mongoose.Schema.Types.Mixed
  },
  // For future extensibility
  extras: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ participants: 1, 'metadata.isDeleted': 1 });
conversationSchema.index({ 'participants.userId': 1, 'metadata.isDeleted': 1 });
conversationSchema.index({ doctorId: 1, patientId: 1, 'metadata.isDeleted': 1 }, { unique: true, sparse: true });
conversationSchema.index({ 'lastMessageAt': -1 });
conversationSchema.index({ 'metadata.createdAt': -1 });
conversationSchema.index({ 'metadata.updatedAt': -1 });
conversationSchema.index({ 'metadata.messageCount': -1 });
conversationSchema.index({ 'settings.supportPriority': 1 });
conversationSchema.index({ 'settings.isArchived': 1 });
conversationSchema.index({ 'settings.isPinned': -1 });
conversationSchema.index({ tags: 1 });

// Text index for search
conversationSchema.index({
  'title': 'text',
  'description': 'text',
  'tags': 'text',
  'lastMessagePreview': 'text'
});

// Virtual for unread message count
conversationSchema.virtual('unreadCount').get(function() {
  if (!this.unreadCounts) return 0;
  const countObj = this.unreadCounts.find(uc => uc.userId && uc.userId.toString() === this._userCondition?.userId?.toString());
  return countObj ? countObj.count : 0;
});

// Pre-save hooks
conversationSchema.pre('save', function(next) {
  // Update timestamps
  this.metadata.updatedAt = new Date();
  
  // Set title for direct messages
  if (this.isDirectMessage && !this.title) {
    // Title will be set in application code based on participants
  }
  
  // Ensure participant count is in sync
  if (this.isModified('participants')) {
    this.metadata.participantCount = this.participants.length;
  }
  
  next();
});

// Method to add a participant
conversationSchema.methods.addParticipant = function(userId, role = 'member', metadata = {}) {
  // Check if user is already a participant
  const existingIndex = this.participants.findIndex(
    p => p.userId.toString() === userId.toString()
  );
  
  if (existingIndex >= 0) {
    // Update existing participant
    this.participants[existingIndex].role = role;
    this.participants[existingIndex].leftAt = undefined;
    this.participants[existingIndex].leftReason = undefined;
    this.participants[existingIndex].isBlocked = false;
    this.participants[existingIndex].metadata = {
      ...this.participants[existingIndex].metadata,
      ...metadata,
      rejoinedAt: new Date()
    };
  } else {
    // Add new participant
    this.participants.push({
      userId,
      role,
      joinedAt: new Date(),
      lastRead: new Date(),
      metadata: {
        ...metadata,
        addedBy: this.metadata.updatedBy || this.metadata.createdBy
      }
    });
  }
  
  // Update participant count
  this.metadata.participantCount = this.participants.length;
  
  return this.save();
};

// Method to remove a participant
conversationSchema.methods.removeParticipant = function(userId, reason = 'left') {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  
  if (participant) {
    participant.leftAt = new Date();
    participant.leftReason = reason;
    this.metadata.updatedBy = this.metadata.updatedBy || this.metadata.createdBy;
    
    // If it's a direct message, archive the conversation for the other user
    if (this.isDirectMessage) {
      this.settings.isArchived = true;
    }
    
    return this.save();
  }
  
  return this;
};

// Method to update last read timestamp for a participant
conversationSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastRead = new Date();
    
    // Reset unread count
    const unreadIndex = this.unreadCounts.findIndex(
      uc => uc.userId.toString() === userId.toString()
    );
    
    if (unreadIndex >= 0) {
      this.unreadCounts[unreadIndex].count = 0;
    }
    
    return this.save();
  }
  
  return this;
};

// Method to increment unread count for all participants except the sender
conversationSchema.methods.incrementUnreadCounts = function(senderId) {
  this.participants.forEach(participant => {
    if (participant.userId.toString() !== senderId.toString() && !participant.leftAt) {
      const unreadIndex = this.unreadCounts.findIndex(
        uc => uc.userId.toString() === participant.userId.toString()
      );
      
      if (unreadIndex >= 0) {
        this.unreadCounts[unreadIndex].count += 1;
      } else {
        this.unreadCounts.push({
          userId: participant.userId,
          count: 1
        });
      }
    }
  });
  
  return this.save();
};

// Static method to find or create direct message conversation
conversationSchema.statics.findOrCreateDirectMessage = async function(user1Id, user2Id, createdBy = user1Id) {
  // Try to find existing direct message conversation
  let conversation = await this.findOne({
    isDirectMessage: true,
    $and: [
      { 'participants.userId': user1Id },
      { 'participants.userId': user2Id },
      { 'participants.2': { $exists: false } } // Only 2 participants
    ],
    'metadata.isDeleted': { $ne: true }
  });
  
  // If not found, create a new one
  if (!conversation) {
    conversation = new this({
      isDirectMessage: true,
      type: 'direct',
      participants: [
        { userId: user1Id, role: 'member' },
        { userId: user2Id, role: 'member' }
      ],
      createdBy,
      doctorId: (await User.findById(user1Id))?.role === 'doctor' ? user1Id : 
               (await User.findById(user2Id))?.role === 'doctor' ? user2Id : null,
      patientId: (await User.findById(user1Id))?.role === 'patient' ? user1Id : 
                (await User.findById(user2Id))?.role === 'patient' ? user2Id : null,
      metadata: {
        createdBy,
        updatedBy: createdBy,
        messageCount: 0,
        participantCount: 2
      }
    });
    
    await conversation.save();
  }
  
  return conversation;
};

// Static method to get conversations for a user with pagination
conversationSchema.statics.getUserConversations = async function(userId, {
  page = 1,
  limit = 20,
  search = '',
  type = null,
  isArchived = false,
  isMuted = null,
  hasUnread = null,
  sortBy = 'lastMessageAt',
  sortOrder = 'desc'
} = {}) {
  const match = {
    'participants.userId': userId,
    'participants.leftAt': { $exists: false },
    'metadata.isDeleted': { $ne: true },
    'settings.isArchived': isArchived
  };
  
  // Apply filters
  if (type) {
    match.type = type;
  }
  
  if (isMuted !== null) {
    match['settings.isMuted'] = isMuted;
  }
  
  if (hasUnread !== null) {
    if (hasUnread) {
      match['unreadCounts'] = {
        $elemMatch: {
          userId: userId,
          count: { $gt: 0 }
        }
      };
    } else {
      match['$or'] = [
        { 'unreadCounts': { $size: 0 } },
        { 'unreadCounts': { $not: { $elemMatch: { userId: userId, count: { $gt: 0 } } } } }
      ];
    }
  }
  
  // Text search
  if (search) {
    match['$text'] = { $search: search };
  }
  
  // Sorting
  const sort = {};
  if (sortBy === 'lastMessageAt') {
    sort.lastMessageAt = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'createdAt') {
    sort['metadata.createdAt'] = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'title') {
    sort.title = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.lastMessageAt = -1; // Default sort
  }
  
  // Get total count for pagination
  const total = await this.countDocuments(match);
  
  // Get paginated results
  const conversations = await this.find(match)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('participants.userId', 'name email avatar role')
    .populate('lastMessage')
    .populate('createdBy', 'name email avatar')
    .populate('doctorId', 'name email avatar')
    .populate('patientId', 'name email avatar')
    .lean();
  
  // Add unread count to each conversation
  return {
    data: conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCounts?.find(uc => 
        uc.userId.toString() === userId.toString()
      )?.count || 0
    })),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Create model
const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
